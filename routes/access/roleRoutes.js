const routes = require('express').Router();
const role = require('../../controllers/access/roleController');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const { route } = require('../user/authRoutes');

//Create role
routes.post('/role',
    authenticate,
    authorize("roles:create"),
    role.addRole
);

//Create Permissions 
routes.post('/permissions',
    authenticate,
    authorize("permissions:create"),
    role.addPermission
)

//assign permission(s) to role
routes.post('/:roleid/permissions',
    authenticate,
    authorize("roles_permission:create"),
    role.addPermissionToRole
);

//get permissions of a role
routes.get('/:roleId/permissions',
    authenticate,
    authorize("roles_permissions:read"),
    role.getRolePermissions
)

//Remove permission from role
routes.delete('/:roleId/permissions/:permissionId',
    authenticate,
    authorize("roles_permissions:delete"),
    role.removePermission
)

module.exports = routes