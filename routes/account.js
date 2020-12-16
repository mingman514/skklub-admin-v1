const express = require('express');
const router = express.Router();

const sql = require("../public/js/mysql-query");
const check = require('../public/js/check')
const bcrypt = require("bcrypt");                        // password hashing https://jungwoon.github.io/node.js/2017/08/07/bcrypt-nodejs/
const log = require('../public/js/insertLog');

// account
router
    .route("/")
    .get(check.checkAuthenticated, (req, res) => {
        res.render("account.ejs", { cname: req.user.cname, flash: "" });
    })
    .post(check.checkAuthenticated, (req, res) => {
        var pw1 = req.body.pw1;
        var pw2 = req.body.pw2;
        var msg = "";

        if (pw1 !== pw2) {
            msg += "변경할 비밀번호를 일치시켜주세요.\n";
        } else if (pw1.length < 6 || pw1.length > 20) {
            msg += "6자리 ~ 20자리 이내로 입력해주세요.\n";
        } else if (pw1.search(/\s/) != -1) {
            msg += "비밀번호에 공백은 포함될 수 없습니다.\n";
        }
        if (msg) {
            req.flash("flash", msg);
            res.redirect("/account");
        } else {
        // 비밀번호 암호화과정 추가
        var _bcrypt = async function (sql) {
            try {
            const hashedPassword = await bcrypt.hash(pw1, 10);
            sql(hashedPassword);
            } catch {
            let msg = "암호화 오류! 관리자에게 문의하세요.";
            req.flash("flash", msg);
            res.redirect("/account");
            }
        };
        _bcrypt((hashedPassword) => {
            sql.generalQuery(
            `UPDATE ${process.env.PROCESSING_DB} SET admin_pw='${hashedPassword}' WHERE cid=${req.user.cid}`,
            null,
            (err, results) => {
                if (err) {
                    console.log(err);
                    msg = "DB UPDATE Query Error! 관리자에게 문의하세요.";
                    req.flash("flash", msg);
                    res.redirect("/account");
                } else {
                    msg = `${req.user.cname}의 계정 비밀번호가 변경되었습니다.<br>다시 로그인해주세요`;
                    log.insertLogByCid(req.user.cid, log.getClientIp(req), 'CHANGE_PW', '')
                    req.logOut();
                    req.flash("flash", msg);
                    res.render("login.ejs");
                }
            }
            )
          })
        }
    })



    module.exports = router;