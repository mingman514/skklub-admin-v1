const express = require('express');
const router = express.Router();

const check = require('../public/js/check')
const sql = require("../public/js/mysql-query")
const encrypt = require('../public/js/encrypt')



router
    .get('/regular', (req, res) => {
        res.render("regist_regular.ejs");
    })





module.exports = router;