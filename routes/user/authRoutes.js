const routes = require('express').Router();
const auth = require('../../controllers/user/authController');

routes.post('/register', auth.registerUser);

routes.get('/verify-email', auth.verifyEmail);

routes.post('/resend-verificationEmail', auth.resendEmailVerification);

routes.post('/login', auth.login); 

routes.post('/forget-password', auth.forgetPassword);

routes.post('/reset-password', auth.resetPassword);

routes.post('/logout', auth.logout);

routes.post('/refresh', auth.refresh)

module.exports = routes;