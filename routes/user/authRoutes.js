const routes = require('express').Router();
const auth = require('../../controllers/user/authController');

routes.post('/register', auth.registerUser);

routes.post('/login', auth.login); 

routes.post('/logout', ()=>{});

routes.get('/email-verification', auth.verifyEmail);

routes.post('/password-reset', auth.resetPassword);

routes.post('/forget-password', auth.forgetPassword);

module.exports = routes;