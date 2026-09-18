const userManager = require('../../data/managers/user/user');
const sessionManager = require('../../data/managers/user/session');
const profileManager = require('../../data/managers/user/profile');
const tokenMangager = require('../../data/managers/user/token');

const TOKEN_TYPE = require('../../lib/enums/tokenType')

const cryptoService = require('../../services/crptoService');

const appError = require('../../lib/errors/appError');

const registerUser = async(req, res, next) => {
    try{
        const {
            email,
            password,
            first_name,
            last_name,
            phone,
            date_of_birth,
            gender
        } = req.body;

        const existingUser = await userManager.getUserByEmailAsync(email);
        if(existingUser){
            throw new appError("User already exist", 400)
        }

        const passwordHash = await cryptoService.hashPassword(password);
        const user = await userManager.createUserAsync(email, passwordHash);
        
        const profile = await profileManager.createProfileAsync(
            user, 
            first_name, 
            last_name, 
            phone, 
            date_of_birth, 
            gender
        );
        
        const token = await cryptoService.generateToken();
        
        const tokenadd = await tokenMangager.createTokenAsync(
            user.id ,
            cryptoService.hashToken(token), 
            TOKEN_TYPE.EMAIL_VERIFICATION,
            new Date(Date.now() + 15 * 60 * 1000),
        );
        
        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
        })
    }catch(err){
        next(err)
    }
    
}   

const login = async(req, res, next) => {
    try{
        const user = await userManager.getUserByEmailAsync(req.body.email);
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User does not exist"
            })
        }
        const isPasswordValid = await cryptoService.comparePassword(req.body.password, user.password_hash);

        if(!isPasswordValid){
            return res.status(401).json({
                success: false,
                message: "Wrong Password"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Login"
        })
    }
    catch(err){
        next(err);
    }
}

const verifyEmail = async(req, res, next) => {

}

const resendEmailVerification = async (req, res, next) => {

}

const forgetPassword = async (req, res, next) => {

}

const resetPassword = async (req, res, next) => {

}

const logout = async (req, res, next) => {

}

module.exports = {
    registerUser,
    login,
    verifyEmail,
    resendEmailVerification,
    forgetPassword,
    resetPassword,
    logout
}

