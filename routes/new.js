const express = require('express');
const Target = require('../models/target');
const router = express.Router();
const axios = require('axios');


const dotenv = require('dotenv');

dotenv.config()

router.get('/', async (req, res) => {
    const screen_name = req.query.screen_name;
    var getUserDataURL = 'https://api.twitter.com/1.1/users/show.json?screen_name=' + screen_name
    var getURL = 'https://api.twitter.com/1.1/friends/list.json?count=200&screen_name='  + screen_name + '&skip_status=true&include_user_entities=false&cursor=';
    var target_data = {}
    var users = []
    var cursor = "-1";
    var response;
    console.log("bruh")
    console.log(process.env.TWITTER_ACCESS_TOKEN)

    target_data = await axios.get(getUserDataURL, {
        headers: {
            'Authorization': 'Bearer ' + process.env.TWITTER_ACCESS_TOKEN
        }
    })
    .then(twitterres => {
        console.log("hello")
        return twitterres.data;
    })
    .catch(err => {
        console.log('Error: ', err.message);
        res.status(400).send("didn't work");
        return
    })

    while (cursor != 0) {
        var tempURL = getURL + cursor;
        console.log(tempURL);
        response = await axios.get(tempURL, {
            headers: {
                'Authorization': 'Bearer ' + process.env.TWITTER_ACCESS_TOKEN
            }
        })
        .then(twitterres => {
            console.log("hello")
            return twitterres.data;
        })
        .catch(err => {
            console.log('Error: ', err.message);
            res.status(400).send("didn't work");
            return
        })
        

        console.log(response)
        cursor = response["next_cursor_str"];
        users = users.concat(response["users"]);
    }

    console.log(users)


    var existingtarget = await Target.findOne({screen_name: screen_name});

    if (!existingtarget) {
        console.log("creating new")
        targetsfriends = {};

        for(i of users) {
            targetsfriends[i["screen_name"]] = {
                screen_name: i["screen_name"],
                date: new Date(),
            }
        }

        const newtarget = new Target({
            name: target_data['name'],
            description: target_data['description'],
            followers_count: target_data['followers_count'],
            friends_count: target_data['friends_count'],
            profile_image_url: target_data['profile_image_url'],
            screen_name: screen_name,
            friends: targetsfriends,
            newfriends: {},
            track_date_start: new Date(),
            last_updated: new Date(),
        })
        await newtarget.save()    

    } else {
        console.log("already exists")
    }

    existingtarget = await Target.findOne({screen_name: screen_name});

    console.log("ended")
    res.json(existingtarget)



})

module.exports = router;
