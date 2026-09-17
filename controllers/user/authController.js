const userManager = require('../../data/managers/user/userManager');

const registerUser = async(req, res, next) => {
    userManager.createUserAsync();
    res.send('User registered successfully');
}   

module.exports = {
    registerUser
}