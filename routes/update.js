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
    var iserror = false;
    console.log("bruh")
    console.log(process.env.TWITTER_ACCESS_TOKEN)

    var existingtarget = await Target.findOne({screen_name: screen_name});

    if (!existingtarget) {
        res.status(404).json("Object does not exist")
    } else {
        console.log("existing target is")
        console.log(existingtarget)
        const currdate = new Date();

        if (existingtarget.last_updated.getDay() == currdate.getDay() &&
            existingtarget.last_updated.getMonth() == currdate.getMonth() &&
            existingtarget.last_updated.getFullYear() == currdate.getFullYear()) {
                console.log("was updated recently")
            res.json(existingtarget)
        }
        else {
            console.log("been more than a day since last update")
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
                    // res.json(existingtarget)
                    iserror = true
                    // res.status(400).send("didn't work");
                    return
                })
                
                if (!iserror) {
                    console.log(response)
                    cursor = response["next_cursor_str"];
                    users = users.concat(response["users"]);
                } else {
                    res.json(existingtarget)
                    break
                }
                
            }
        
            console.log(users)
    
            console.log("exists rn")
            var existingfriends = existingtarget.friends
            console.log(typeof existingfriends);
            var existingnewfriends = {}
            
            if (existingtarget.newfriends){
                existingnewfriends = existingtarget.newfriends
    
                console.log("before for each")
                existingnewfriends.forEach((value, key) => {
                    console.log(existingnewfriends.get(key))
                    console.log(existingnewfriends.get(key)["date"])
                    console.log(existingnewfriends.get(key)["date"].getFullYear())
                    var datevar = existingnewfriends.get(key)["date"]
                    if (datevar.getFullYear() == currdate.getFullYear()) {
                        console.log("here1")
                        if (datevar.getMonth() != currdate.getMonth()) {
                            console.log("here2")
                            if (datevar.getMonth() - currdate.getMonth() == -1) {
                                console.log("here3")
                                if (31 - (datevar.getDate()) + currdate.getDate() > 31) {
                                    console.log("here4")
                                    // delete existingnewfriends.
                                    existingnewfriends.delete(key)
                                    console.log("deleted")
                                }
                            } else {
                                console.log("here5")
                                existingnewfriends.delete(key)
                            }
                        }
                    } else {
                        if (datevar.getMonth() == 12 && currdate.getMonth() == 1) {
                            console.log("here6")
                            if (31 - (datevar.getDate()) + currdate.getDate() > 31) {
                                console.log("here7")
                                // delete existingnewfriends.i
                                existingnewfriends.delete(key)
                                console.log("deleted")
                            }
                        } else {
                            console.log("here8")
                            existingnewfriends.delete(key)
                        }
    
                    }
                })
                console.log("stopped")
            }
    
            
            console.log("new friends")
            console.log(existingnewfriends)
            
            console.log(existingfriends)
            for(i of users) {
                if (existingfriends.has(i["screen_name"])){
                    
                } else {
                    console.log("new")
                    console.log(i["screen_name"])
    
                    // new
                    existingfriends.set(i["screen_name"], {
                        screen_name: i["screen_name"],
                        date: new Date()
                    });
                    existingnewfriends.set(i["screen_name"], {
                        screen_name: i["screen_name"],
                        date: new Date()
                    });
                }
            }
    
            console.log("New Friends")
            console.log(existingnewfriends)
            console.log("Existing Friends")
            console.log(existingfriends)
    
            
            try{
                existingtarget.friends = existingfriends;
                existingtarget.newfriends = existingnewfriends;
                existingtarget.name= target_data['name'];
                existingtarget.description= target_data['description'];
                existingtarget.followers_count= target_data['followers_count'];
                existingtarget.friends_count= target_data['friends_count'];
                existingtarget.profile_image_url= target_data['profile_image_url'];
                existingtarget.last_updated = new Date();
                const tempvar = await existingtarget.save()
                console.log(tempvar)
            } catch(err){
                console.log("error aaaaaa")
                console.log(err)
            }

            existingtarget = await Target.findOne({screen_name: screen_name});
            console.log("ended")
            res.json(existingtarget)
        }      
    }

    
    



})

module.exports = router;
