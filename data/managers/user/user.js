const User = require('../../models/user/userModel');
const Profile = require('../../models/user/profileModel');
const Role = require("../../models/access/roleModel");
const RolePermission = require("../../models/access/rolePermissionModel");
const Permission = require("../../models/access/permissionModel");
const USER_STATUS = require('../../../lib/enums/userStatus');

const createUserAsync = async (email, hashPassword, role_id, transaction) => {
    return await User.create({
        email,
        password_hash: hashPassword,
        role_id,
        status: USER_STATUS.ACTIVE,
        is_email_verified: false
    },
    {
        transaction
    })
}

const updateUserAsync = async () => {
    
}

const getUserListAsync = async() => {
    return await User.findAll();
}

const getUserByEmailAsync = async(email) => {
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
        ]
    })
}

const getUserByIdAsync = async (id) => {
    return await User.findByPk(id);
}

const deleteUserAsync = async(id) => {
    return await User.destroy({
        where: {
            id
        }
    })
}

const verifyEmailAsync = async (id, transaction) => {
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

const updateUserLoginAsync = async(id, last_login, transaction) => {
    return await User.update({
        last_login
    },
    {
        where: {
            id
        },
        transaction
    });
}

const UpdateUserPasswordAsync = async (id, password_hash, transaction) => {
    return await User.update({
            password_hash
        },
        {
            where: {
                id
            },
            transaction
    })
}

const getUserWithRoleAndPermissions = async (user_id)=>{
    return  User.findByPk(
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
}

module.exports = {
    createUserAsync,
    updateUserAsync,
    getUserListAsync,
    getUserByIdAsync,
    getUserByEmailAsync,
    deleteUserAsync,
    verifyEmailAsync,
    updateUserLoginAsync,
    UpdateUserPasswordAsync,
    getUserWithRoleAndPermissions
}
