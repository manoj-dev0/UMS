const routes = require('express').Router();
const role = require('../../controllers/access/roleController');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const { route } = require('../user/authRoutes');

//Create role
routes.post('/role',
    authenticate,
    role.addRole
);

//Create Permissions 
routes.post('/permissions',
    authenticate,
    role.addPermission
)

//assign permission(s) to role
routes.post('/:roleid/permissions',
    authenticate,
    role.addPermissionToRole
);

//get permissions of a role
routes.get('/:roleId/permissions',
    authenticate,
    role.getRolePermissions
)

//Remove permission from role
routes.delete('/:roleId/permissions/:permissionId',
    authenticate,
    role.removePermission
)



module.exports = routes