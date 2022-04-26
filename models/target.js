const mongoose = require('mongoose');
// const User = require('../models/user');


// create a user schema with username and password
// create a user model with the schema
// export the user model
module.exports = mongoose.model('Target', new mongoose.Schema({
    id: String,
    name: String,
    description: String,
    screen_name: String,
    followers_count: Number,
    friends_count: Number,
    profile_image_url: String,
    track_date_start: Date,
    last_updated: Date,
    // friends: {
    //     type: Map,
    //     of: String
    // },
    // newfriends: {
    //     type: Map,
    //     of: String
    // },
    friends: {
        type: Map,
        of: new mongoose.Schema({
            screen_name: String,
            date: Date,
          })
    },
    newfriends: {
        type: Map,
        of: new mongoose.Schema({
            screen_name: String,
            date: Date,
          })
    },
}))


