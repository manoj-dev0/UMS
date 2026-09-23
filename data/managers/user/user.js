const User = require("../../models/user/userModel");
const Profile = require("../../models/user/profileModel");

const Role = require("../../models/access/roleModel");
const RolePermission = require("../../models/access/rolePermissionModel");
const Permission = require("../../models/access/permissionModel");

const USER_STATUS = require("../../../lib/enums/userStatus");


// =====================================================
// CREATE USER
// =====================================================

const createUserAsync = async (
    email,
    hashPassword,
    role_id,
    transaction
) => {

    return await User.create(
        {
            email,
            password_hash: hashPassword,
            role_id,
            status: USER_STATUS.ACTIVE,
            is_email_verified: false
        },
        {
            transaction
        }
    );
};


// =====================================================
// UPDATE USER
// =====================================================

const updateUserAsync = async (
    id,
    userData,
    transaction = null
) => {

    await User.update(
        userData,
        {
            where: {
                id
            },
            transaction
        }
    );

    return await getUserByIdAsync(id);
};


// =====================================================
// GET ALL USERS
// =====================================================

const getUserListAsync = async () => {

    return await User.findAll({
        include: [
            {
                model: Profile
            }
        ]
    });
};


// =====================================================
// GET USER BY EMAIL
// =====================================================

const getUserByEmailAsync = async (email, transaction = null) => {

    return await User.findOne({
        where: {
            email
        },
        include: [
            {
                model: Profile,
                attributes: [
                    "first_name",
                    "last_name"
                ]
            }
        ],
        transaction
    });
};


// =====================================================
// GET USER BY ID
// =====================================================

const getUserByIdAsync = async (id, transaction = null) => {

    return await User.findByPk(
        id,
        {
            include: [
                {
                    model: Profile
                }
            ],
            transaction
        }
    );
};


// =====================================================
// DELETE USER
// =====================================================

const deleteUserAsync = async (
    id,
    transaction = null
) => {

    return await User.destroy({
        where: {
            id
        },
        transaction
    });
};


// =====================================================
// VERIFY EMAIL
// =====================================================

const verifyEmailAsync = async (
    id,
    transaction
) => {

    return await User.update(
        {
            is_email_verified: true
        },
        {
            where: {
                id
            },
            transaction
        }
    );
};


// =====================================================
// UPDATE LAST LOGIN
// =====================================================

const updateUserLoginAsync = async (
    id,
    last_login,
    transaction
) => {

    return await User.update(
        {
            last_login
        },
        {
            where: {
                id
            },
            transaction
        }
    );
};


// =====================================================
// UPDATE PASSWORD
// =====================================================

const updateUserPasswordAsync = async (
    id,
    password_hash,
    transaction
) => {

    return await User.update(
        {
            password_hash
        },
        {
            where: {
                id
            },
            transaction
        }
    );
};


// =====================================================
// GET USER WITH ROLE & PERMISSIONS
// =====================================================

const getUserWithRoleAndPermissions = async (user_id) => {

    return await User.findByPk(
        user_id,
        {
            include: [
                {
                    model: Role,
                    include: [
                        {
                            model: RolePermission,
                            include: [
                                {
                                    model: Permission
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    );
};


module.exports = {
    createUserAsync,
    updateUserAsync,
    getUserListAsync,
    getUserByIdAsync,
    getUserByEmailAsync,
    deleteUserAsync,
    verifyEmailAsync,
    updateUserLoginAsync,
    updateUserPasswordAsync,
    getUserWithRoleAndPermissions
};