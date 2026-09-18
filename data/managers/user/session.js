const Session = require('../../models/user/sessionModel');

const createSessionAsync = async (userId, token, deviceId, expiresAt) => {
    return await Session.create({
        user_id : userId,
        token_hash: token,
        device_id: deviceId,
        expires_at : expiresAt
    })
}

module.exports = { 
    createSessionAsync,
}
