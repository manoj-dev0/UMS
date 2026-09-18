const User = require('../../models/user/userModel');
const USER_STATUS = require('../../../lib/enums/userStatus');
const createUserAsync = async (email, hashPassword) => {
    return await User.create({
        email,
        password_hash: hashPassword,
        status: USER_STATUS.ACTIVE,
        is_email_verified: false
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
        }
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

module.exports = {
    createUserAsync,
    updateUserAsync,
    getUserListAsync,
    getUserByEmailAsync,
    deleteUserAsync,
}
