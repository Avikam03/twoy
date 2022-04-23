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
    var getURL = 'https://api.twitter.com/1.1/friends/list.json?count=200&screen_name='  + screen_name + '&skip_status=true&include_user_entities=false&cursor=';

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
            // console.log(err)
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
        console.log("doesn't exist rn")
        targetsfriends = {};

        for(i of users) {
            // console.log(i["screen_name"]); // prints the name of every user followed by the screen_name
            // targetsfriends[i["screen_name"]] = i["screen_name"]; // pushes the screen_name of every user 
            targetsfriends[i["screen_name"]] = {
                screen_name: i["screen_name"],
                date: new Date(),
            }
        }

        const newtarget = new Target({
            screen_name: screen_name,
            friends: targetsfriends
        })
        await newtarget.save()    

    } else {
        console.log("exists rn")
        var existingfriends = existingtarget.friends
        console.log(typeof existingfriends);
        var existingnewfriends = {}
        if (existingtarget.newfriends){
            existingnewfriends = existingtarget.newfriends
        }
        console.log("new friends")
        console.log(existingnewfriends)

        const currdate = new Date();

        console.log("before for each")
        existingnewfriends.forEach((value, key) => {
            // console.log(value, key)
            console.log(existingnewfriends.get(key))
            console.log(existingnewfriends.get(key)["date"])
            console.log(existingnewfriends.get(key)["date"].getFullYear())
            // console.log(existingnewfriends[key])
            // console.log(existingnewfriends[key]["date"])
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

        // for (i in existingnewfriends) {
            // console.log(existingnewfriends[i])
            // console.log(existingnewfriends[i]["date"])

            // if (existingnewfriends.i["date"].getFullYear() == currdate.getFullYear()) {
            //     if (existingnewfriends.i["date"].getMonth() != currdate.getMonth()) {
            //         if (existingnewfriends.i["date"].getMonth() - currdate.getMonth() == -1) {
            //             if (31 - (existingnewfriends.i["date"].getDate()) + currdate.getDate() > 31) {
            //                 delete existingnewfriends.i
            //             }
            //         }
            //     }
            // } else {
            //     if (existingnewfriends.i["date"].getMonth() == 12 && currdate.getMonth() == 1) {
            //         if (31 - (i["date"].getDate()) + currdate.getDate() > 31) {
            //             delete existingnewfriends.i
            //         }
            //     }

            // }
        // }


        // for (i of existingnewfriends) {
        //     if (i["date"].getFullYear() == currdate.getFullYear()) {
        //         if (i["date"].getMonth() != currdate.getMonth()) {
        //             if (i["date"].getMonth() - currdate.getMonth() == -1) {
        //                 if (31 - (i["date"].getDate()) + currdate.getDate() > 31) {
        //                     delete i
        //                 }
        //             } else if (i["date"].getMonth() == 12 && currdate.getMonth() == 1) {
        //                 if (31 - (i["date"].getDate()) + currdate.getDate() > 31) {
        //                     delete i
        //                 }
        //             }

        //             }
        //         }
        //     } else {

        //     }
        // }

        
        console.log(existingfriends)
        for(i of users) {
            if (existingfriends.has(i["screen_name"])){
                
            } else {
                console.log("new")
                console.log(i["screen_name"])
                // existingfriends.set(i["screen_name"], i["screen_name"]);
                // existingnewfriends.set(i["screen_name"], i["screen_name"]);
                // existingfriends.set(i["screen_name"],{
                //     screen_name: i["screen_name"],
                //     date: new Date()
                // });
                // existingnewfriends.set(i["screen_name"], {
                //     screen_name: i["screen_name"],
                //     date: new Date()
                // });
                existingfriends.set(i["screen_name"], {
                    screen_name: i["screen_name"],
                    date: new Date()
                });
                existingnewfriends[i["screen_name"]] = {
                    screen_name: i["screen_name"],
                    date: new Date()
                };
                // existingfriends.i["screen_name"] = {
                //     screen_name: i["screen_name"],
                //     date: new Date()
                // };
                // existingnewfriends.i["screen_name"] = {
                //     screen_name: i["screen_name"],
                //     date: new Date()
                // };
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
            const tempvar = await existingtarget.save()
            console.log(tempvar)
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