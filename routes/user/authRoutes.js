const routes = require('express').Router();
const { registerUser } = require('../../controllers/user/authController')
routes.post('/register', registerUser);

routes.post('/login', (req, res) => {
    // Handle user login logic here
    res.send('User logged in successfully');
}); 

routes.post('/logout', (req, res) => {
    // Handle user logout logic here
    res.send('User logged out successfully');
});

routes.get('/email-verification', (req, res) => {
    // Handle email verification logic here
    res.send('Email verified successfully');
});

routes.post('/password-reset', (req, res) => {
    // Handle password reset logic here
    res.send('Password reset link sent successfully');
});

routes.post('/forget-password', (req, res) => {
    // Handle password reset confirmation logic here
    res.send('Password reset successfully');
});

module.exports = routes;