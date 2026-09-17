const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../connection/databaseConnection');

const User = require('./userModel');

class Session extends Model {}

Session.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        device_id:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        token_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        revoked_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        last_used_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },

    },
    {
        sequelize,
        modelName: 'Session',
        tableName: 'sessions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

Session.belongsTo(User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});

User.hasMany(Session,{
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});

module.exports = Session;