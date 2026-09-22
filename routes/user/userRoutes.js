const routes = require('express').Router();

const user = require('../../controllers/user/userController');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

routes.post(
    "/",
    authenticate,
    authorize("users:create"),
    user.addUser
);

routes.get(
    "/profiles",
    authenticate,
    authorize("profiles:read"),
    user.getAllProfiles
);

routes.get(
    "/:id/profile",
    authenticate,
    authorize("profiles:read"),
    user.getProfile
);

routes.get(
    "/profile",
    authenticate,
    user.getUserProfile
)

module.exports = routes