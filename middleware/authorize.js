const appError = require("../lib/errors/appError");
const userManager = require("../data/managers/user/user");

const authorize = (permissionCode) => {

    return async (req, res, next) => {
        try {

            console.log("========== AUTHORIZATION ==========");
            console.log("Permission requested:", permissionCode);
            console.log("Authenticated user:", req.user);

            if (!req.user || !req.user.userId) {
                throw new appError(
                    "Unauthorized",
                    401
                );
            }

            const user =
                await userManager.getUserWithRoleAndPermissions(
                    req.user.userId
                );

            console.log("User returned:", !!user);

            if (!user) {
                throw new appError(
                    "User not found",
                    401
                );
            }

            console.log("User role:", user.Role?.name);

            const rolePermission =
                user.Role?.RolePermissions?.find(
                    (rolePermission) =>
                        rolePermission.Permission?.code === permissionCode
                );

            console.log(
                "Matching permission:",
                rolePermission?.Permission?.code
            );

            console.log(
                "Permission scope:",
                rolePermission?.scope
            );

            if (!rolePermission) {
                throw new appError(
                    "You do not have permission to perform this action",
                    403
                );
            }

            req.permission = {
                code: permissionCode,
                scope: rolePermission.scope
            };

            console.log("Authorization passed");
            console.log("===================================");

            next();

        } catch (err) {
            console.error("Authorization error:", err);
            next(err);
        }
    };
};

module.exports = authorize;