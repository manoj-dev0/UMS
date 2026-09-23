const { Op } = require('sequelize');
const Profile = require('../../models/user/profileModel');
const User = require('../../models/user/userModel');

const createProfileAsync = async (user, first_name, last_name, phone_number, date_of_birth, gender, transaction) => {
    return await Profile.create({
        user_id: user.id,
        first_name,
        last_name,
        phone_number,
        date_of_birth,
        gender,
    },
    {
        transaction
    });
}

const getProfileByUserIdAsync = async (user_id) => {
    return await Profile.findOne({
        where: {
            user_id
        },
        include: [
            {
                model: User,
                attributes: ['id', 'email', 'status', 'role_id', 'last_login', 'is_email_verified']
            }
        ]
    });
}

const getAllProfilesAsync = async () => {
    return await Profile.findAll({
        include: [
            {
                model: User,
                attributes: ['id', 'email', 'status', 'role_id', 'last_login', 'is_email_verified']
            }
        ]
    });
}

const updateProfileAsync = async (user_id, profileData) => {
    return await Profile.update(
        profileData,
        {
            where: {
                user_id
            },
            returning: true
        }
    );
}

const searchProfilesByNameAsync = async (name) => {
    const searchTerm = name.trim();

    if (!searchTerm) {
        return [];
    }

    return await Profile.findAll({
        where: {
            [Op.or]: [
                {
                    first_name: {
                        [Op.iLike]: `%${searchTerm}%`
                    }
                },
                {
                    last_name: {
                        [Op.iLike]: `%${searchTerm}%`
                    }
                },
                {
                    [Op.and]: [
                        {
                            first_name: {
                                [Op.iLike]: `%${searchTerm.split(' ')[0]}%`
                            }
                        },
                        {
                            last_name: {
                                [Op.iLike]: `%${searchTerm.split(' ').slice(1).join(' ')}%`
                            }
                        }
                    ]
                }
            ]
        },
        include: [
            {
                model: User,
                attributes: ['id', 'email', 'status', 'role_id', 'last_login', 'is_email_verified']
            }
        ],
        order: [['first_name', 'ASC'], ['last_name', 'ASC']]
    });
}

module.exports = {
    createProfileAsync,
    getProfileByUserIdAsync,
    getAllProfilesAsync,
    updateProfileAsync,
    searchProfilesByNameAsync
}