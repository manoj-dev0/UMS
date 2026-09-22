const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../connection/databaseConnection");

const Role = require('./roleModel');
const Permission = require('./permissionModel');
const SCOPE_TYPE = require('../../../lib/enums/scopeType');
class RolePermission extends Model {}

RolePermission.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },

        role_id: {
            type: DataTypes.UUID,
            allowNull: false
        },

        permission_id: {
            type: DataTypes.UUID,
            allowNull: false
        },

        scope: {
            type: DataTypes.ENUM(...Object.values(SCOPE_TYPE)),
            allowNull: false,
            defaultValue: SCOPE_TYPE.SELF
        }
    },
    {
        sequelize,
        modelName: "RolePermission",
        tableName: "role_permissions",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",

        indexes: [
            {
                unique: true,
                fields: ["role_id", "permission_id"]
            }
        ]
    }
);

Role.hasMany(RolePermission, {
    foreignKey: "role_id",
    onDelete: 'CASCADE'
});

RolePermission.belongsTo(Role, {
    foreignKey: "role_id",
    onDelete: 'CASCADE'
});

Permission.hasMany(RolePermission, {
    foreignKey: "permission_id",
    onDelete: 'CASCADE'
});

RolePermission.belongsTo(Permission, {
    foreignKey: "permission_id",
    onDelete: 'CASCADE'
});
module.exports = RolePermission;