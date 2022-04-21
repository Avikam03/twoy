const express = require('express');
// const User = require('../models/user');
const Target = require('../models/target');
const router = express.Router();
const axios = require('axios');


const dotenv = require('dotenv')

dotenv.config()


router.get('/', async (req, res) => {
    const screen_name = req.query.screen_name;
    const getURL = 'https://api.twitter.com/1.1/friends/list.json?cursor=-1&screen_name='  + screen_name + '&skip_status=true&include_user_entities=false';

    // var users

    const users = await axios.get(getURL, {
        headers: {
            'Authorization': 'Bearer ' + process.env.TOKEN
        }
    })
    
    .then(twitterres => {
        // console.log(twitterres.data)
        console.log("hello")
        // console.log(twitterres.data["users"])
        // users = twitterres.data["users"];
        return  twitterres.data["users"];

    })
    .catch(err => {
        console.log('Error: ', err.message);
        res.status(400).send("didn't work");
        return "error"
    });

    console.log(users)


    var existingtarget = await Target.findOne({screen_name: screen_name});

    if (!existingtarget) {
        console.log("doesn't exist rn")
        targetsfriends = [];

        for(i of users) {
            // console.log(i["screen_name"]); // prints the name of every user followed by the screen_name
            targetsfriends.push(i["screen_name"]); // pushes the screen_name of every user 
        }

        const newtarget = new Target({
            screen_name: screen_name,
            friends: targetsfriends
        })
        await newtarget.save()    

    } else {
        console.log("exists rn")
        existingfriends = existingtarget.friends

        for(i of users) {
            if (!existingfriends.includes(i["screen_name"])) {
                existingfriends.push(i["screen_name"]);
                existingtarget.newfriends.push(i["screen_name"]);
            }
        }
        existingtarget.friends = existingfriends;
        await existingtarget.save()
    }

    console.log("bruh")
    // console.log(users)
    res.json({status: 'success'})



})

module.exports = router;

