const sequelize = require('../../data/connection/databaseConnection');

const userManager = require('../../data/managers/user/user');
const profileManager = require('../../data/managers/user/profile');
const tokenMangager = require('../../data/managers/user/token');

const appError = require('../../lib/errors/appError');
const TOKEN_TYPE = require('../../lib/enums/tokenType');

const mailService = require('../../services/mailService');
const cryptoService = require('../../services/crptoService');

const addUser = async (req, res, next) => {
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

            const existingUser =
                await userManager.getUserByEmailAsync(
                    email,
                    transaction
                );

            if (existingUser) {
                throw new appError(
                    "User already exists",
                    400
                );
            }

            const passwordHash =
                await cryptoService.hashPassword(password);

            const user =
                await userManager.createUserAsync(
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

            const token = cryptoService.generateToken();

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
            message: "User created successfully."
        });

    } catch (err) {
        next(err);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { scope } = req.permission;

        if (
            scope === "SELF" &&
            req.user.userId !== id
        ) {
            throw new appError(
                "You do not have access to this profile",
                403
            );
        }

        const profile = await profileManager.getProfileByUserIdAsync(id);

        if (!profile) {
            throw new appError(
                "Profile not found",
                404
            );
        }

        return res.status(200).json({
            success: true,
            data: profile
        });

    } catch (err) {
        next(err);
    }
};

const getAllProfiles = async (req, res, next) => {
    try {
        const { scope } = req.permission;

        let profiles;

        if (scope === "ALL") {
            profiles = await profileManager.getAllProfilesAsync();
        } else if (scope === "SELF") {
            profiles = await profileManager.getProfileByUserIdAsync(
                req.user.userId
            );
        } else {
            throw new appError(
                "Invalid permission scope",
                403
            );
        }

        return res.status(200).json({
            success: true,
            data: profiles
        });

    } catch (err) {
        next(err);
    }
};

const getUserProfile = async (req, res, next) => {
    try{
        const {userId} = req.user;

        const user = await userManager.getUserByIdAsync(userId);

        if(!user){
            throw new appError(
                "User does not exist",
                404
            )
        }

        res.status(200).json({
            success: true,
            data: user
        })

    }catch(err){
        next(err);
    }
}

module.exports = {
    addUser,
    getProfile,
    getAllProfiles,
    getUserProfile
}