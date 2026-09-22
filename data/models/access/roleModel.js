const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../connection/databaseConnection");

const User = require("../user/userModel");

class Role extends Model {}

Role.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        description: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: "Role",
        tableName: "roles",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

User.belongsTo(Role, {
    foreignKey: "role_id",
});


module.exports = Role;