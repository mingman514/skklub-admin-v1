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
    (req, res, next) => { passport.authenticate('local', (err, user, info) => { // info에 passport-config.js에서 autheticateUser로 return한 message, cid 담김

      // Get IP
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      if(ip.indexOf(':') > -1 ) {
        let splitedIp = ip.split(':');
        ip = splitedIp[splitedIp.length - 1]
      }
      console.log(ip)

        if (err) return next(err);

        // Login Fail
        if (!user) {
          // in case ID matched but PW wrong
          if(info.cid) {log.insertLogByCid(info.cid, ip, 'LOGIN', 'FAIL');}

          return res.render('login.ejs', { message : info.message })
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