const authRoutes = require('./user/authRoutes');

const routes = require('express').Router();

routes.use('/auth', authRoutes);

module.exports = routes;