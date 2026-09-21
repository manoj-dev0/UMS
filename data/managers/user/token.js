const Token = require('../../models/user/tokenModel');

const createTokenAsync = async (user_id, token_hash, type, expires_at, transaction) => {
    return await Token.create({
        user_id ,
        token_hash ,
        type ,
        expires_at
    },
    {
        transaction
    })
}

const markTokenUsedAsync = async (id, transaction) => {
    return await Token.update({
        used_at: new Date()
    },
    {
        where: {
            id
        },
        transaction
    })
}

const getTokenAsync = async (token_hash, type, transaction) => {
    return await Token.findOne({
        where: {
            token_hash,
            type
        },
        transaction
    })
}

const InvalidateTokenAsync = async(user_id, type, transaction) => {
    return await Token.update(
        {
            used_at: new Date()
        },
        {
            where: {
                user_id,
                type,
                used_at: null
            },
            transaction
        }
    );
}



module.exports = {
    createTokenAsync,
    markTokenUsedAsync,
    getTokenAsync,
    InvalidateTokenAsync
   
}