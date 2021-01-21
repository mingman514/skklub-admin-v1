const express = require('express');
const router = express.Router();

const check = require('../custom_modules/check')
const passport = require('passport');
const log = require('../custom_modules/insertLog');


router
    .route("/")
    .get(check.checkNotAuthenticated, (req, res) => {
        res.render("login.ejs");
    })
    .post(
    (req, res, next) => { passport.authenticate('local', (err, user, info) => { // info에 passport-config.js에서 autheticateUser로 return한 message, cid 담김

      let ip = log.getClientIp(req);
      
        if (err) return next(err);

        // Login Fail
        if (!user) {
          // in case ID matched but PW wrong
          if(info.cid) {log.insertLogByCid(info.cid, ip, 'LOGIN', 'FAIL');}

          req.flash("flash", info.message);
          return res.render('login.ejs')
        };

        // Login Success
        req.logIn(user, function(err) {
          if (err) { return next(err); }

          log.insertLogByCid(info.cid, ip, 'LOGIN', 'SUCCESS');

          return res.redirect('/');
        });
      })(req, res, next);
    }
    );





  module.exports = router;