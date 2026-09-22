const authRoutes = require('./user/authRoutes');
const userRoutes = require('./user/userRoutes');
const roleRoutes = require('./access/roleRoutes')
const routes = require('express').Router();

routes.use('/auth', authRoutes);
routes.use('/user', userRoutes);
routes.use('/access', roleRoutes);
module.exports = routes;