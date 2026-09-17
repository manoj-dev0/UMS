const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../connection/databaseConnection');
const GENDER = require('../../../lib/enums/gender');

const User = require('./userModel');

class Profile extends Model {}

Profile.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id:{
            type: DataTypes.UUID,
            allowNull: false,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        profile_picture_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        date_of_birth: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        gender: {
            type: DataTypes.ENUM(...Object.values(GENDER)),
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Profile',
        tableName: 'profiles',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

Profile.belongsTo(User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});

User.hasOne(Profile,{
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});

module.exports = Profile;