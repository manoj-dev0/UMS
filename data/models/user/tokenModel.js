const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../connection/databaseConnection');
const TOKEN_TYPE = require('../../../lib/enums/tokenType');

const User = require('./userModel');

class Token extends Model {}

Token.init(
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
        token_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM(...Object.values(TOKEN_TYPE)),
            allowNull: false,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        used_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Token',
        tableName: 'tokens',   
        timestamps: true,
        createdAt: 'created_at',
    }
);

Token.belongsTo(User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});

User.hasMany(Token,{
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});

module.exports = Token;
