const routes = require('express').Router();

const user = require('../../controllers/user/userController');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const upload = require('../../middleware/uploadmiddleware');

//create user 
routes.post(
    "/",
    authenticate,
    authorize("users:create"),
    user.addUser
);

//search users by name
routes.get(
    "/search",
    authenticate,
    authorize("profile:read"),
    user.searchUsers
);

//get all users profile
routes.get(
    "/profiles",
    authenticate,
    authorize("profiles:read"),
    user.getAllProfiles
);

//get current logged-in user profile
routes.get(
    "/profile",
    authenticate,
    authorize("profiles:read"),
    user.getUserProfile
);

//get user profile by Id 
routes.get(
    "/:id/profile",
    authenticate,
    authorize("profiles:read"),
    user.getProfile
);

//update another user's profile if allowed by permission
routes.put(
    "/:id/profile",
    authenticate,
    authorize("profiles:update"),
    user.updateUserProfileById
);

//update current user's profile
routes.put(
    '/profile',
    authenticate,
    authorize("profiles:update"),
    user.updateUserProfile
);

//change password of another user if allowed by permission
routes.put(
    "/:id/change-password",
    authenticate,
    authorize("users:update"),
    user.changePasswordById
);

//change password
routes.put(
    "/change-password",
    authenticate,
    authorize("users:update"),
    user.changePassword
);

//change user role
routes.put(
    "/:user_id/role",
    authenticate,
    authorize("users:update"),
    user.changeUserRole
);

//Delete user
routes.delete(
    "/:id",
    authenticate,
    authorize("users:delete"),
    user.deleteUser
);

//update or change profile image (same purpose, different naming)
routes.post(
    "/profile/image",
    authenticate,
    authorize("profiles:update"),
    upload.single('image'),
    user.uploadProfileImage
);

//update or change another user's profile image if allowed by permission
routes.post(
    "/:user_id/profile/image",
    authenticate,
    authorize("profiles:update"),
    upload.single('image'),
    user.uploadProfileImageById
);

module.exports = routes