const Session = require('../../models/user/sessionModel');

const createSessionAsync = async (userId, token, deviceId, expiresAt, transaction) => {
    return await Session.create({
        user_id : userId,
        token_hash: token,
        device_id: deviceId,
        expires_at : expiresAt
    },
    {
        transaction
    })
}

const revokeAllSessionsAsync = async(user_id, transaction) =>{
    return await Session.update({
        revoked_at : new Date()
    },{
        where: {
            user_id,
            revoked_at: null
        },
        transaction
    })
}

const revokeSessionAsync = async(id) => {
    return await Session.update(
        {
            revoked_at: new Date()
        },
        {
            where: {
                id,
                revoked_at: null
            }        
        }
    );
}

const getSessionByRefreshTokenAsync = async (token_hash) =>{
    return await Session.findOne({
        where: {
            token_hash
        }
    })
}

const updateRefreshTokenAsync = async (id, token_hash, expires_at, transaction) =>{
    return await Session.update({
        token_hash,
        expires_at,
        last_used_st: new Date()
    },{
        where: {
            id,
            revoked_at: null
        },
        transaction
    });
}

module.exports = { 
    createSessionAsync,
    revokeAllSessionsAsync,
    revokeSessionAsync,
    getSessionByRefreshTokenAsync,
    updateRefreshTokenAsync
}
