const roleManager = require("../../data/managers/access/role");
const rolePermissionManager = require("../../data/managers/access/rolePermission");
const permissionManager = require("../../data/managers/access/permission");

const appError = require("../../lib/errors/appError");

const addRole = async (req, res, next) => {
    try{
        const {
            name,
            description
        } = req.body;

        const existingRole = await roleManager.getRoleByNameAsync(name);
        if (existingRole) {
            throw new appError(
                "Role already exists",
                400
            );
        }

        await roleManager.createRoleAsync(name, description);

        return res.status(201).json({
            success: true,
            message: "Role created successfully",
        });

    }catch(err){
        next(err)
    }
};

const addPermissionToRole = async (req, res, next) => {
    try {
        const { roleid } = req.params;
        const { permissions } = req.body;
        console.log(roleid);
        if (!Array.isArray(permissions) || permissions.length === 0) {
            throw new appError(
                "At least one permission is required",
                400
            );
        }

        const role =
            await roleManager.getRoleByIdAsync(roleid);

        if (!role) {
            throw new appError(
                "Role not found",
                404
            );
        }

        for (const permission of permissions) {

            if (!permission.permission_id) {
                throw new appError(
                    "Permission ID is required",
                    400
                );
            }

            if (!permission.scope) {
                throw new appError(
                    "Permission scope is required",
                    400
                );
            }

            const existingPermission =
                await rolePermissionManager
                    .getRolePermissionAsync(
                        roleid,
                        permission.permission_id,
                        permission.scope
                    );

            if (existingPermission) {
                throw new appError(
                    "One or more permissions are already assigned to this role",
                    400
                );
            }

        }

        const rolePermissions =
            await rolePermissionManager
                .createRolePermissionsAsync(
                    roleid,
                    permissions
                );

        return res.status(201).json({
            success: true,
            message: "Permissions assigned to role successfully",
        });

    } catch (err) {
        next(err);
    }
};

const addPermission = async (req, res, next) => {
    try {
        const {
            code,
            resource,
            action,
            description
        } = req.body;

        if (!code || !resource || !action) {
            throw new appError(
                "Code, resource and action are required",
                400
            );
        }

        const existingPermission =
            await permissionManager.getPermissionByCodeAsync(code);

        if (existingPermission) {
            throw new appError(
                "Permission already exists",
                400
            );
        }

        const permission =
            await permissionManager.createPermissionAsync(
                code,
                resource,
                action,
                description
            );

        return res.status(201).json({
            success: true,
            message: "Permission created successfully",
        });

    } catch (err) {
        next(err);
    }
};

const getRolePermissions = async (req, res, next) => {
    try {
        const { roleId } = req.params;

        if (!roleId) {
            throw new appError(
                "Role ID is required",
                400
            );
        }

        const permissions =
            await rolePermissionManager.getPermissionsOfRoleAsync(roleId);

        if (!permissions || permissions.length === 0) {
            throw new appError(
                "No permissions found for this role",
                404
            );
        }

        return res.status(200).json({
            success: true,
            data: permissions
        });

    } catch (err) {
        next(err);
    }
};

const removePermission = async (req, res, next) => {
    try {
        const { roleId, permissionId } = req.params;

        if (!roleId) {
            throw new appError(
                "Role ID is required",
                400
            );
        }

        if (!permissionId) {
            throw new appError(
                "Permission ID is required",
                400
            );
        }

        const rolePermission =
            await rolePermissionManager.getRolePermissionOnlyAsync(
                roleId,
                permissionId
            );

        if (!rolePermission) {
            throw new appError(
                "Permission is not assigned to this role",
                404
            );
        }

        await rolePermissionManager.removePermissionFromRoleAsync(
            roleId,
            permissionId
        );

        return res.status(200).json({
            success: true,
            message: "Permission removed from role successfully"
        });

    } catch (err) {
        next(err);
    }
};

module.exports = {
    addRole,
    addPermission,
    addPermissionToRole,
    getRolePermissions,
    removePermission
}

