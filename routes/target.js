const express = require('express');
const Target = require('../models/target');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
    const screen_name = req.query.screen_name;

    let obj = await Target.findOne({screen_name: screen_name})

    if (obj) {
        res.send(obj)
    } else {
        res.status(401).json("Object does not exist")
    }
})

module.exports = router;
