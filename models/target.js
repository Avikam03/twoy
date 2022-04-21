const mongoose = require('mongoose');
// const User = require('../models/user');


// create a user schema with username and password
// create a user model with the schema
// export the user model
module.exports = mongoose.model('Target', new mongoose.Schema({
    id: String,
    screen_name: String,
    profile_background_image_url_https: String,
    // friends: [User]
    friends: {
        type: Map,
        of: String
    },
    newfriends: {
        type: Map,
        of: String
    },
}))


