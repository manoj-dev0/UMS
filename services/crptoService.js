const crypto = require('crypto');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken')

const generateToken = ()=>{
    return crypto.randomBytes(32).toString('hex');
};

const generateJWT = (user)=>{
    return jwt.sign(
        {
            userId: user.id,
            email: user.email
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
        }
    );
}

const hashPassword = async (password) => {
    return await argon2.hash(password, {
        type: argon2.argon2id
    })
}

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
}

const comparePassword = async (password, passwordHash) => {
    return await argon2.verify(passwordHash, password);
}

const compareToken = (token, tokenHash) => {
    const hashedToken = hashToken(token);

    return hashedToken === tokenHash;
};

module.exports = {
    hashPassword,
    hashToken,
    generateToken,
    generateJWT,
    comparePassword,
    compareToken
}