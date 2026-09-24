const sequelize = require('../../data/connection/databaseConnection');
const s3Client = require('../../data/connection/s3Connection');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

const userManager = require('../../data/managers/user/user');
const profileManager = require('../../data/managers/user/profile');
const tokenMangager = require('../../data/managers/user/token');
const roleManager = require('../../data/managers/access/role');

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

        const user = await profileManager.getProfileByUserIdAsync(userId);

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

const updateUserProfile = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const {
            first_name,
            last_name,
            phone_number,
            date_of_birth,
            gender,
            profile_picture_url
        } = req.body;

        const currentProfile = await profileManager.getProfileByUserIdAsync(userId);

        if (!currentProfile) {
            throw new appError("User profile not found", 404);
        }

        const profileData = {
            ...(first_name !== undefined && { first_name }),
            ...(last_name !== undefined && { last_name }),
            ...(phone_number !== undefined && { phone_number }),
            ...(date_of_birth !== undefined && { date_of_birth }),
            ...(gender !== undefined && { gender }),
            ...(profile_picture_url !== undefined && { profile_picture_url })
        };

        if (Object.keys(profileData).length === 0) {
            throw new appError("No profile fields were provided", 400);
        }

        await profileManager.updateProfileAsync(userId, profileData);

        const updatedProfile = await profileManager.getProfileByUserIdAsync(userId);

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedProfile
        });

    } catch (err) {
        next(err);
    }
};

const updateUserProfileById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { scope } = req.permission;

        if (scope === "SELF" && req.user.userId !== id) {
            throw new appError("You do not have access to update this profile", 403);
        }

        const {
            first_name,
            last_name,
            phone_number,
            date_of_birth,
            gender,
            profile_picture_url
        } = req.body;

        const currentProfile = await profileManager.getProfileByUserIdAsync(id);

        if (!currentProfile) {
            throw new appError("User profile not found", 404);
        }

        const profileData = {
            ...(first_name !== undefined && { first_name }),
            ...(last_name !== undefined && { last_name }),
            ...(phone_number !== undefined && { phone_number }),
            ...(date_of_birth !== undefined && { date_of_birth }),
            ...(gender !== undefined && { gender }),
            ...(profile_picture_url !== undefined && { profile_picture_url })
        };

        if (Object.keys(profileData).length === 0) {
            throw new appError("No profile fields were provided", 400);
        }

        await profileManager.updateProfileAsync(id, profileData);

        const updatedProfile = await profileManager.getProfileByUserIdAsync(id);

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedProfile
        });

    } catch (err) {
        next(err);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            throw new appError("Current password and new password are required", 400);
        }

        const user = await userManager.getUserByIdAsync(userId);

        if (!user) {
            throw new appError("User not found", 404);
        }

        const isValidPassword = await cryptoService.comparePassword(current_password, user.password_hash);

        if (!isValidPassword) {
            throw new appError("Current password is incorrect", 401);
        }

        const passwordHash = await cryptoService.hashPassword(new_password);

        await userManager.updateUserPasswordAsync(userId, passwordHash);

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (err) {
        next(err);
    }
};

const changePasswordById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { scope } = req.permission;
        const { current_password, new_password } = req.body;

        if (scope === "SELF" && req.user.userId !== id) {
            throw new appError("You do not have permission to update this user's password", 403);
        }

        const user = await userManager.getUserByIdAsync(id);

        if (!user) {
            throw new appError("User not found", 404);
        }

        const isSelfUpdate = Number(req.user.userId) === Number(id);

        if (isSelfUpdate) {
            if (!current_password || !new_password) {
                throw new appError("Current password and new password are required", 400);
            }

            const isValidPassword = await cryptoService.comparePassword(current_password, user.password_hash);

            if (!isValidPassword) {
                throw new appError("Current password is incorrect", 401);
            }
        } else {
            if (!new_password) {
                throw new appError("New password is required", 400);
            }
        }

        const passwordHash = await cryptoService.hashPassword(new_password);

        await userManager.updateUserPasswordAsync(id, passwordHash);

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (err) {
        next(err);
    }
};

const changeUserRole = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const { role_id } = req.body;

        if (!user_id) {
            throw new appError("User ID is required", 400);
        }

        if (!role_id) {
            throw new appError("Role ID is required", 400);
        }

        const user = await userManager.getUserByIdAsync(user_id);

        if (!user) {
            throw new appError("User not found", 404);
        }

        const role = await roleManager.getRoleByIdAsync(role_id);

        if (!role) {
            throw new appError("Role not found", 404);
        }

        await userManager.updateUserAsync(user_id, { role_id });

        const updatedUser = await userManager.getUserByIdAsync(user_id);

        return res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: {
                user_id: updatedUser.id,
                role_id: updatedUser.role_id
            }
        });

    } catch (err) {
        next(err);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { scope } = req.permission;

        if (scope === "SELF" && req.user.userId !== id) {
            throw new appError("You do not have access to delete this user", 403);
        }

        const user = await userManager.getUserByIdAsync(id);

        if (!user) {
            throw new appError("User not found", 404);
        }

        await userManager.deleteUserAsync(id);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (err) {
        next(err);
    }
};

const uploadProfileImage = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const file = req.file;

        if (!file) {
            throw new appError("Image file is required", 400);
        }

        const bucketName = process.env.AWS_S3_BUCKET_NAME;
        const awsRegion = process.env.AWS_REGION;

        if (!bucketName || !awsRegion) {
            throw new appError(
                "AWS S3 configuration is missing. Please set AWS_BUCKET_NAME and AWS_REGION in your .env file.",
                500
            );
        }

        const fileExtension = file.originalname.split('.').pop();
        const fileName = `profiles/${userId}/${Date.now()}.${fileExtension}`;

        await s3Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));

        const profilePictureUrl = `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${fileName}`;

        const currentProfile = await profileManager.getProfileByUserIdAsync(userId);

        if (!currentProfile) {
            throw new appError("User profile not found", 404);
        }

        await profileManager.updateProfileAsync(userId, { profile_picture_url: profilePictureUrl });

        return res.status(200).json({
            success: true,
            message: "Profile image updated successfully",
            data: {
                profile_picture_url: profilePictureUrl
            }
        });

    } catch (err) {
        next(err);
    }
};

const uploadProfileImageById = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const { scope } = req.permission;
        const file = req.file;

        if (scope === "SELF" && req.user.userId !== user_id) {
            throw new appError("You do not have access to update this user's profile image", 403);
        }

        if (!file) {
            throw new appError("Image file is required", 400);
        }

        const bucketName = process.env.AWS_S3_BUCKET_NAME;
        const awsRegion = process.env.AWS_REGION;

        if (!bucketName || !awsRegion) {
            throw new appError(
                "AWS S3 configuration is missing. Please set AWS_BUCKET_NAME and AWS_REGION in your .env file.",
                500
            );
        }

        const fileExtension = file.originalname.split('.').pop();
        const fileName = `profiles/${user_id}/${Date.now()}.${fileExtension}`;

        await s3Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));

        const profilePictureUrl = `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${fileName}`;

        const currentProfile = await profileManager.getProfileByUserIdAsync(user_id);

        if (!currentProfile) {
            throw new appError("User profile not found", 404);
        }

        await profileManager.updateProfileAsync(user_id, { profile_picture_url: profilePictureUrl });

        return res.status(200).json({
            success: true,
            message: "Profile image updated successfully",
            data: {
                user_id,
                profile_picture_url: profilePictureUrl
            }
        });

    } catch (err) {
        next(err);
    }
};

const searchUsers = async (req, res, next) => {
    try {
        const { name } = req.query;

        if (!name || !String(name).trim()) {
            throw new appError("Name is required to search users", 400);
        }

        const profiles = await profileManager.searchProfilesByNameAsync(String(name));

        return res.status(200).json({
            success: true,
            data: profiles
        });

    } catch (err) {
        next(err);
    }
};


module.exports = {
    addUser,
    getProfile,
    getAllProfiles,
    getUserProfile,
    updateUserProfile,
    updateUserProfileById,
    changePassword,
    changePasswordById,
    changeUserRole,
    deleteUser,
    uploadProfileImage,
    uploadProfileImageById,
    searchUsers
}