const express = require('express');
// const User = require('../models/user');
const Target = require('../models/target');
const router = express.Router();
const axios = require('axios');


const dotenv = require('dotenv');
const { db } = require('../models/target');

dotenv.config()


router.get('/', async (req, res) => {
    const screen_name = req.query.screen_name;
    var getURL = 'https://api.twitter.com/1.1/friends/list.json?screen_name='  + screen_name + '&skip_status=true&include_user_entities=false&cursor=';

    var users = []
    var cursor = "-1";
    var response;
    console.log("bruh")
    console.log(process.env.TWITTER_ACCESS_TOKEN)

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
            // return  twitterres.data["users"];
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

    // const users = await axios.get(getURL, {
    //     headers: {
    //         'Authorization': 'Bearer ' + process.env.TOKEN
    //     }
    // })


    console.log(users)


    var existingtarget = await Target.findOne({screen_name: screen_name});

    if (!existingtarget) {
        console.log("doesn't exist rn")
        targetsfriends = {};

        for(i of users) {
            // console.log(i["screen_name"]); // prints the name of every user followed by the screen_name
            targetsfriends[i["screen_name"]] = i["screen_name"]; // pushes the screen_name of every user 
        }

        const newtarget = new Target({
            screen_name: screen_name,
            friends: targetsfriends
        })
        await newtarget.save()    

    } else {
        console.log("exists rn")
        var existingfriends = existingtarget.friends
        var existingnewfriends = {}
        if (existingtarget.newfriends){
            existingnewfriends = existingtarget.newfriends
        }
        
        console.log(existingfriends)
        for(i of users) {
            if (existingfriends.has(i["screen_name"])){
                
            } else {
                console.log("new")
                console.log(i["screen_name"])
                existingfriends.set(i["screen_name"], i["screen_name"]);
                existingnewfriends.set(i["screen_name"], i["screen_name"]);
            }
        }

        console.log("New Friends")
        console.log(existingnewfriends)
        console.log("Existing Friends")
        console.log(existingfriends)

        // db.collection("targets").updateOne(
        //     {"screen_name" : screen_name},
        //     { $set}
        // )
        
        try{
            existingtarget.friends = existingfriends;
            existingtarget.newfriends = existingnewfriends;
            const bakchodi = await existingtarget.save()
            console.log(bakchodi)
        } catch(err){
            console.log("error araha bhai")
            console.log(err)
        }
        
    }

    console.log("bruh")
    // console.log(users)
    res.json({status: 'success'})



})

module.exports = router;


        // for(i of users) {
        //     if (!existingfriends[i["screen_name"]]) {
        //         existingfriends[i["screen_name"]] = i["screen_name"];
        //         existingnewfriends[i["screen_name"]] = i["screen_name"];
        //     }
        // }