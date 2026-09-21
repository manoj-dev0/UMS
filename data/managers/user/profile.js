const Profile = require('../../models/user/profileModel')

const createProfileAsync = async (user, first_name, last_name, phone_number, date_of_birth, gender, transaction) => {
    return await Profile.create({
        user_id: user.id,
        first_name,
        last_name,
        phone_number,
        date_of_birth,
        gender,
    },
    {
        transaction
    });
}

module.exports = {
    createProfileAsync,

}