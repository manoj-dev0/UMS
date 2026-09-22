const Permission = require("../../models/access/permissionModel");

const getPermissionByCodeAsync = async (code) =>{
    return await Permission.findOne({
        where: {
            code
        }
    });
}

const createPermissionAsync = async ( code, resource, action, description) => {
    return await Permission.create({
        code,
        resource,
        action,
        description
    });
}

module.exports = {
    getPermissionByCodeAsync,
    createPermissionAsync,
}