const express = require('express');
const router = express.Router();

const check = require('../public/js/check')
const sql = require("../public/js/mysql-query")
const encrypt = require('../public/js/encrypt')
const nodemailer = require('nodemailer')

const smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
  });



router
    .get('/regular', (req, res) => {
        res.render("regist_regular.ejs");
    })

router
    .post('/verifyMail', (req, res) => {
        
        let cname = req.body.cname
        let president = req.body.president
        let skkuMail = req.body.skku_mail

        // 이메일 중복시 단체명도 검사
        sql.generalQuery(
            `SELECT COUNT(*) FROM REG_REGIST WHERE VERIF_EMAIL='${skkuMail}'`,
            null,
            (err, results) => {
                if (err) {
                    console.log(err);
                    res.json({'RESULT':'SQL_ERROR'})
                } else {
                    let SQL = ''
                    if(results === 1){
                        SQL = `SELECT * FROM REG_REGIST WHERE VERIF_EMAIL='${skkuMail}'`
                    } else {
                        SQL = `SELECT * FROM REG_REGIST WHERE VERIF_EMAIL='${skkuMail}' AND CNAME='${cname}'`
                    }

                    sql.generalQuery(
                        SQL, null, (err, results) => {
                            if (err) {
                                console.log(err);
                                res.json({'RESULT':'SQL_ERROR'})
                            } else {
                                let result = results[0]
                                // 이메일 존재하면 인증번호 갱신
                                // check 1. 이미 완료된 아이디
                                // check 2. 10번 이상 시도
                                // 인증성공시 시도 초기화 해야할듯
                                console.log(result)
                                if(!result){
                                    res.json({'RESULT':'NOT_EXIST'})
                                } else if(result.COMPLETED){
                                    res.json({'RESULT' : 'ALREADY_EXIST'})
                                // } else if(result.TRIAL_NUM > 10){
                                //     res.json({'RESULT' : 'OVER_TRY_LIMIT'})
                                } else {
                                    res.json({'RESULT' : 'NEXT_STEP', 'ID' : result.ID})
                                }
                            }
                        })
                }
            })
    })


router
    .post('/sendVerifyCode', (req, res) => {
        const targetId = req.body.id
        const targetMail = req.body.skku_mail
        const veriCode = getRandomInt(100000, 999999)
        const mailOptions = {
            from: process.env.MAIL_ADDRESS,
            to: targetMail,
            subject: "SKKLUB 인증메일입니다.",
            text: `인증번호 ${veriCode}를 입력해주세요.`
        };

        // Update Database
        sql.generalQuery(
            `UPDATE REG_REGIST SET VERIF_NUM=${veriCode} WHERE ID='${targetId}'; `,
            null,
            (err, results) => {
                if (err) {
                    console.log(err);
                    res.json({'RESULT':'FAIL'})
                } else {

                // Sending Mail
                smtpTransport.sendMail(mailOptions, (error, responses) =>{
                    if(error){
                        console.log(error)
                        res.json({'RESULT' : 'FAIL'})
                    }else{
                        console.log(`Email sent! ---> VERIF_CODE = ${veriCode}`)
                    
                        smtpTransport.close();
                        res.json({'RESULT' : 'SUCCESS', 'ID' : targetId})
                    }
                });


            }
    })
})


router
    .post('/matchVerifCode', (req, res) => {
        const targetId = req.body.id
        const verifCode = req.body.verif_code       // 사용자가 보낸 인증번호
        
        // DB에서 인증번호 비교 후 업데이트!


    })




function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
    }

module.exports = router;