const userManager = require('../../data/managers/user/user');
const sessionManager = require('../../data/managers/user/session');
const profileManager = require('../../data/managers/user/profile');
const tokenMangager = require('../../data/managers/user/token');

const TOKEN_TYPE = require('../../lib/enums/tokenType');
const USER_STATUS = require('../../lib/enums/userStatus');

const cryptoService = require('../../services/crptoService');
const mailService = require('../../services/mailService');

const appError = require('../../lib/errors/appError');
const sequelize = require('../../data/connection/databaseConnection');

const registerUser = async (req, res, next) => {
    try {
        const {
            email,
            password,
            first_name,
            last_name,
            phone_number,
            role_id,
            date_of_birth,
            gender
        } = req.body;

        const result = await sequelize.transaction(async (transaction) => {

            const existingUser = await userManager.getUserByEmailAsync(
                email,
                transaction
            );

            if (existingUser) {
                throw new appError("User already exists", 400);
            }

            const passwordHash =
                await cryptoService.hashPassword(password);

            const user = await userManager.createUserAsync(
                email,
                passwordHash,
                role_id,
                transaction
            );

            await profileManager.createProfileAsync(
                user,
                first_name,
                last_name,
                phone_number,
                date_of_birth,
                gender,
                transaction
            );

            const token = await cryptoService.generateToken();
            console.log(token);
            await tokenMangager.createTokenAsync(
                user.id,
                cryptoService.hashToken(token),
                TOKEN_TYPE.EMAIL_VERIFICATION,
                new Date(Date.now() + 30 * 60 * 1000),
                transaction
            );

            return {
                user,
                token
            };
        });


        await mailService.sendVerificationEmail(
            email,
            first_name,
            result.token
        );

        return res.status(201).json({
            success: true,
            message: "User registered successfully."
        });

    } catch (err) {
        next(err);
    }
};

const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;

        if (!token) {
            throw new appError(
                "Verification token is required",
                400
            );
        }

        const tokenHash = cryptoService.hashToken(token);

        const result = await sequelize.transaction(
            async (transaction) => {

                const verificationToken =
                    await tokenMangager.getTokenAsync(
                        tokenHash,
                        TOKEN_TYPE.EMAIL_VERIFICATION,
                        transaction
                    );

                if (!verificationToken) {
                    throw new appError(
                        "Invalid verification token",
                        400
                    );
                }

                if (
                    new Date() >
                    new Date(verificationToken.expires_at)
                ) {
                    throw new appError(
                        "Verification token has expired",
                        400
                    );
                }

                if (verificationToken.used_at) {
                    throw new appError(
                        "Verification token has already been used",
                        400
                    );
                }

                const user =
                    await userManager.getUserByIdAsync(
                        verificationToken.user_id,
                        transaction
                    );

                if (!user) {
                    throw new appError(
                        "User does not exist",
                        404
                    );
                }

                await userManager.verifyEmailAsync(
                    user.id,
                    transaction
                );

                await tokenMangager.markTokenUsedAsync(
                    verificationToken.id,
                    transaction
                );

                return user;
            }
        );

        return res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });

    } catch (err) {
        next(err);
    }
};

const resendEmailVerification = async (req, res, next) => {
    try{
        const {email} = req.body;

        const user = await userManager.getUserByEmailAsync(email);

        if(!user){
            throw new appError(
                "User does not exist",
                404
            );
        }

        if(user.is_email_verified){
            throw new appError(
                "Email is already verified",
                400
            );
        }
        const token = await sequelize.transaction(async (transaction) => {
            await tokenMangager.InvalidateTokenAsync(
                user.id, 
                TOKEN_TYPE.EMAIL_VERIFICATION, 
                transaction
            );

            const token = await cryptoService.generateToken();
            const tokenHash = cryptoService.hashToken(token);

            await tokenMangager.createTokenAsync(
                user.id,
                tokenHash,
                TOKEN_TYPE.EMAIL_VERIFICATION,
                new Date(Date.now() + 15* 60 *1000)
            )

            return token;
        })
        
        await mailService.sendVerificationEmail(
            user.email,
            user.Profile.first_name,
            token
        );

        return res.status(200).json({
            success: true,
            message: "verification email sent successfully"
        })

    }
    catch(err){
        next(err);
    }
};

const login = async(req, res, next) => {
    try{
        const {
            email,
            password,
            device_id
        } = req.body

        const user = await userManager.getUserByEmailAsync(email);

        if(!user){
            throw new appError(
                "Invalid cridentials", 
                401
            )
        }

        const isValidPassword = await cryptoService.comparePassword(password, user.password_hash);

        if (!isValidPassword) {
            throw new appError(
                "Invalid credentials.",
                401
            );
        }

        if (user.status !== USER_STATUS.ACTIVE) {
            throw new appError(
                "Your account is not active.",
                403
            );
        }

        if (!user.is_email_verified) {
            throw new appError(
                "Please verify your email before logging in.",
                403
            );
        }

        const deviceId = device_id || crypto.randomUUID();

        const refreshToken = cryptoService.generateToken();

        const accessToken = cryptoService.generateJWT(user);

        const expiresAt = new Date(
            Date.now() +
            7 * 24 * 60 * 60 * 1000
        );

        await sequelize.transaction(async (transaction) => {
            await sessionManager.createSessionAsync(
                user.id,
                cryptoService.hashToken(refreshToken),
                deviceId,
                expiresAt,
                transaction
            )

            await userManager.updateUserLoginAsync(
                user.id,
                new Date(),
                transaction
            )
        })

        res.cookie("refreshToken", refreshToken,{
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        const user_id = user.id;
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data:{
                user_id,
                deviceId,
                accessToken
            }
        });
    }
    catch(err){
        next(err);
    }
};

const forgetPassword = async (req, res, next) => {
    try{
        const {email} = req.body;

        const user = await userManager.getUserByEmailAsync(email);

        if(!user){
            throw new appError(
                "Invalid cridentials", 
                401
            )
        }

        const token = await sequelize.transaction( async (transaction) => {
            await tokenMangager.InvalidateTokenAsync(
                user.id, 
                TOKEN_TYPE.PASSWORD_RESET, 
                transaction
            );

            const token = await cryptoService.generateToken();
            const tokenHash = cryptoService.hashToken(token);

            await tokenMangager.createTokenAsync(
                user.id,
                tokenHash,
                TOKEN_TYPE.PASSWORD_RESET,
                new Date(Date.now() + 15* 60 *1000),
                transaction
            );

            return token;
        })
        
        await mailService.sendPasswordResetEmail(
            email, 
            user.Profile.first_name, 
            token
        );

        return res.status(200).json({
            success: true,
            message: "Email resetting link send to your email"
        });

    }catch(err){
        next(err);
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const {token, password} = req.body;

        if (!token) {
            throw new appError(
                "Verification token is required",
                400
            );
        }

        const tokenHash = cryptoService.hashToken(token);

        const resetToken = await tokenMangager.getTokenAsync(
            tokenHash, 
            TOKEN_TYPE.PASSWORD_RESET
        );

        if (!resetToken) {
            throw new appError(
                "Invalid or expired reset token",
                400
            );
        }

        if (resetToken.used_at) {
            throw new appError(
                "Reset token has already been used",
                400
            );
        }

        if (new Date() > resetToken.expires_at) {
            throw new appError(
                "Reset token has expired",
                400
            );
        }

        const passwordHash = await cryptoService.hashPassword(password);

        await sequelize.transaction(
            async (transaction) =>{
                await userManager.UpdateUserPasswordAsync(
                    resetToken.user_id, 
                    passwordHash, 
                    transaction
                );

                await tokenMangager.InvalidateTokenAsync(
                    resetToken.user_id, 
                    TOKEN_TYPE.PASSWORD_RESET, 
                    transaction
                );

                await sessionManager.revokeAllSessionsAsync(
                    resetToken.user_id,
                    transaction
                );
            }
        )

        res.status(200).json({
            success: true,
            message: "Password changed"
        })


    }catch(err){
        next(err);
    }
}

const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            const refreshTokenHash =
                cryptoService.hashToken(refreshToken);

            const session =
                await sessionManager.getSessionByRefreshTokenAsync(
                    refreshTokenHash
                );

            if (session && !session.revoked_at) {
                await sessionManager.revokeSessionAsync(
                    session.id, req.body.device_id
                );
            }
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (err) {
        next(err);
    }
};

const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            throw new appError(
                "Unauthorized",
                401
            );
        }

        const refreshTokenHash = cryptoService.hashToken(refreshToken);

        const session = await sessionManager.getSessionByRefreshTokenAsync(refreshTokenHash);

        if (!session) {
            throw new appError(
                "Unauthorized",
                401
            );
        }

        if (session.revoked_at) {
            throw new appError(
                "Session has been revoked",
                401
            );
        }

        if (new Date() > session.expires_at) {
            throw new appError(
                "Session has expired",
                401
            );
        }

        const user = await userManager.getUserByIdAsync(session.user_id);

        if (!user) {
            throw new appError(
                "Unauthorized",
                401
            );
        }

        if (user.status !== USER_STATUS.ACTIVE) {
            throw new appError(
                "Account is not active",
                403
            );
        }

        const newAccessToken = cryptoService.generateJWT(user);
        const newRefreshToken = cryptoService.generateToken();
        const newRefreshTokenHash = cryptoService.hashToken(newRefreshToken);
        const newExpiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        await sequelize.transaction(async (transaction) => {
            await sessionManager.updateRefreshTokenAsync(
                session.id,
                newRefreshTokenHash,
                newExpiresAt,
                transaction
            )
        })

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            data: {
                accessToken: newAccessToken
            }
        });
    }
    catch(err){
        next(err);
    }
};

module.exports = {
    registerUser,
    verifyEmail,
    resendEmailVerification,
    login,
    forgetPassword,
    resetPassword,
    logout,
    refresh
}

