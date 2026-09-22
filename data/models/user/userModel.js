const { Model, DataTypes} = require('sequelize')
const sequelize = require('../../connection/databaseConnection')
const USER_STATUS = require('../../../lib/enums/userStatus')

class User extends Model {}

User.init(
    {
        id:{
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: { 
            type: DataTypes.ENUM(...Object.values(USER_STATUS)),
            allowNull: false,
            defaultValue: USER_STATUS.ACTIVE
        },
        is_email_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        role_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',

        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

module.exports = User