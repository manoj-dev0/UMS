const Token = require('../../models/user/tokenModel');

const createTokenAsync = async (user_id, token_hash, type, expires_at) => {
    return await Token.create({
        user_id ,
        token_hash ,
        type ,
        expires_at
    })
}

module.exports = {
    createTokenAsync
}