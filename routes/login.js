const express = require('express');
const router = express.Router();

const check = require('../public/js/check')
const passport = require('passport');



router
    .route("/")
    .get(check.checkNotAuthenticated, (req, res) => {
        res.render("login.ejs");
    })
    .post(passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })
  );





  module.exports = router;