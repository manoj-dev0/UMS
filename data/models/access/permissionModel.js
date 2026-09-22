const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../connection/databaseConnection");

class Permission extends Model {}

Permission.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },

        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        resource: {
            type: DataTypes.STRING,
            allowNull: false
        },

        action: {
            type: DataTypes.STRING,
            allowNull: false
        },

        description: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: "Permission",
        tableName: "permissions",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",

        indexes: [
            {
                unique: true,
                fields: ["resource", "action"]
            }
        ]
    }
);


module.exports = Permission;