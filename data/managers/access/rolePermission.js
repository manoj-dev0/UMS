const RolePermission = require('../../models/access/rolePermissionModel');
const Permission = require('../../models/access/permissionModel');

const getRolePermissionAsync = async ( role_id, permission_id, scope) =>{
    return await RolePermission.findOne({
        where: {
            role_id,
            permission_id,
            scope
        }
    });
}

const getRolePermissionOnlyAsync = async ( role_id, permission_id) =>{
    return await RolePermission.findOne({
        where: {
            role_id,
            permission_id,
        }
    });
}

const getPermissionsOfRoleAsync = async (role_id) => {
    return await RolePermission.findAll({
        where: {
            role_id
        },
        include: [
            {
                model: Permission,
                attributes: [
                    "id",
                    "code",
                    "resource",
                    "action",
                    "description"
                ]
            }
        ]
    });
};

const createRolePermissionsAsync = async (role_id, permissions) => {

    const rolePermissions = permissions.map((permission) => ({
        role_id,
        permission_id: permission.permission_id,
        scope: permission.scope
    }));

    return await RolePermission.bulkCreate(rolePermissions);
};

const removePermissionFromRoleAsync = async (role_id, permission_id) => {
    return await RolePermission.destroy({
        where: {
            role_id,
            permission_id
        }
    });
};

module.exports = {
    getRolePermissionAsync,
    createRolePermissionsAsync,
    getPermissionsOfRoleAsync,
    removePermissionFromRoleAsync,
    getRolePermissionOnlyAsync
};





