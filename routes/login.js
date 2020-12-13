const express = require('express');
const router = express.Router();

const check = require('../public/js/check')
const passport = require('passport');
const log = require('../public/js/insertLog')



router
    .route("/")
    .get(check.checkNotAuthenticated, (req, res) => {
        res.render("login.ejs");
    })
    .post(
    //   passport.authenticate("local", {
    //   successRedirect: "/",
    //   failureRedirect: "/login",
    //   failureFlash: true,
    // })
    (req, res, next) => { passport.authenticate('local', (err, user, info) => { // info에 passport-config.js에서 autheticateUser로 return한 message, cid 담김
        if (err) return next(err);

        // Login Fail
        if (!user) {
          // in case ID matched but PW wrong
          if(info.cid) {log.insertLogByCid(info.cid, 'LOGIN', 'FAIL');}

          return res.render('login.ejs', { message : info.message })
        };

        // Login Success
        req.logIn(user, function(err) {
          if (err) { return next(err); }

          log.insertLogByCid(info.cid, 'LOGIN', 'SUCCESS');

          return res.redirect('/');
        });
      })(req, res, next);
    }
    );





  module.exports = router;