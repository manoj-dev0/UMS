const Role = require('../../models/access/roleModel');

const createRoleAsync = async(name, description)=>{
    return await Role.create({
        name,
        description
    });
}

const getRoleByIdAsync = async (role_id, transaction)=>{
    return await Role.findByPk(role_id)
}

const getRoleByNameAsync = async (name) =>{
    return await Role.findOne({
        where: {
            name
        }
    });
}


module.exports = {
    getRoleByIdAsync,
    getRoleByNameAsync,
    createRoleAsync
}