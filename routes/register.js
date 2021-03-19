const express = require('express');
const router = express.Router();

const check = require('../custom_modules/check')
const sql = require("../custom_modules/mysql-query")
const encrypt = require('../custom_modules/encrypt')
const log = require('../custom_modules/insertLog');
const nodemailer = require('nodemailer')

const smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    pool: true,
    host: "admin.skklub.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD
    }
  });


/**
 * 정규등록
 */
router
    .get('/regular', (req, res) => {
        res.render("regist_regular.ejs", {cname: req.user.cname? req.user.cname : null});
    })

router
    .post('/verifyMail', (req, res) => {
        
        let cname = req.body.cname
        let president = req.body.president
        let skkuMail = req.body.skku_mail

        // 이메일 중복시 단체명도 검사
        sql.requestData(
            `SELECT COUNT(*) AS CNT FROM REG_REGIST WHERE VERIF_EMAIL='${skkuMail}'`,
            null,
            (err, results) => {
                if (err) {
                    console.log(err);
                    res.json({'RESULT':'SQL_ERROR'})
                } else {
                    let SQL = ''

                    if(results[0].CNT === 1){
                        SQL = `SELECT * FROM REG_REGIST WHERE VERIF_EMAIL='${skkuMail}'`
                    } else {
                        SQL = `SELECT * FROM REG_REGIST WHERE VERIF_EMAIL='${skkuMail}' AND CNAME='${cname}'`
                    }
                    console.log(SQL)

                    sql.requestData(
                        SQL, null, (err, results) => {
                            if (err) {
                                console.log(err);
                                res.json({'RESULT':'SQL_ERROR'})
                            } else {
                                let result = results[0]
                                // 이메일 존재하면 인증번호 갱신
                                // check 1. 이미 완료된 아이디
                                // check 2. 10번 이상 인증요청
                                if(!result){
                                    res.json({'RESULT':'NOT_EXIST'})
                                } else if(result.COMPLETED){
                                    res.json({'RESULT' : 'ALREADY_EXIST'})
                                } else if(result.TRIAL_NUM > 10){
                                    res.json({'RESULT' : 'OVER_TRY_LIMIT'})
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
        const targetCname = req.body.cname

        const veriCode = getRandomInt(100000, 999999)
        const mailOptions = {
            from: process.env.MAIL_ADDRESS,
            to: targetMail,
            subject: "SKKLUB 인증메일입니다.",
            text: `
            
            안녕하세요, ${targetCname} 대표자님
            
            ---------------------------------------

            인증번호 [ ${veriCode} ]를 입력해주세요.
            (※ 인증번호는 3분간 유효)

            ---------------------------------------
            
            인증 과정에서 문제가 발생하거나 본인인증을 시도한 적이 없다면,
            아래 연락처로 문의바랍니다.

            SKKLUB 운영팀 드림


            
            < SKKLUB >
            About      https://www.notion.so/9f2a5b7d93a54fedb36c961afa1fb254
            Main       https://www.skklub.com/
            Admin      https://admin.skklub.com/
            
            (문의 010-5686-3455 또는 010-2969-9875)
            `
        };

        // Update Database
        sql.requestData(
            
            `UPDATE REG_REGIST SET VERIF_NUM=${veriCode}, VERIF_REQ_TIME=CURRENT_TIMESTAMP(), TRIAL_NUM=TRIAL_NUM+1 WHERE ID='${targetId}'; `,
            null,
            (err, results) => {
                if (err) {
                    console.log(err);
                    res.json({'RESULT':'FAIL'})
                } else {

                // Sending Mail
                smtpTransport.sendMail(mailOptions, (error, responses) =>{
                    console.log('Sending Email...')
                    if(error){
                        console.log(error)
                        res.json({'RESULT' : 'FAIL'})
                    }else{
                        console.log(`Email Sent! ---> VERIF_CODE = ${veriCode}`)
                        // smtpTransport.close();
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
        sql.requestData(
            `SELECT VERIF_NUM, VERIF_REQ_TIME FROM REG_REGIST WHERE ID=${targetId};`,
            null,
            (err, results) => {
                if (err) {
                    console.log(err);
                    res.json({'RESULT':'FAIL'})
                } else {
                    var result = results[0]
                    let _now = new Date()
                    let timeLapsed = Math.floor( ( _now.getTime() - result.VERIF_REQ_TIME.getTime() ) / 1000 )
                    // 시간 초과 (180 sec)
                    if(timeLapsed > 180){
                        res.json({'RESULT' : 'TIME_OVER'})
                    }
                    // 인증번호 
                    else if(result.VERIF_NUM !== Number(verifCode)){
                        res.json({'RESULT' : 'WRONG_CODE'})
                    } else {
                        res.json({'RESULT' : 'SUCCESS', 'ID' : targetId})
                    }
                }
            })

    })


router
    .post('/checkExistId', (req, res) => {
        const adminId = req.body.adminId
        const targetId = req.body.id
        sql.requestData(
            `SELECT EXISTS (SELECT * FROM ${process.env.PROCESSING_DB} WHERE admin_id='${adminId}') AS SUCCESS`,
            null, (err, results) => {
                        if (err) {
                            console.log(err);
                            res.json({'RESULT':'FAIL'})
                        } else {
                            if(results[0].SUCCESS){
                                res.json({'RESULT':'ALREADY_EXIST'})
                            } else {
                                res.json({'RESULT' : 'NEXT', 'ID' : targetId})
                            }
                        }
        })
    })

router
    .post('/createAccount', (req, res) => {
        const targetId = req.body.id
        const cname = req.body.cname
        const adminId = req.body.adminId
        const adminPw = req.body.adminPw

        // Encrypt adminPw
        encrypt.hashItem(adminPw, (hashedPassword) => {
            // INSERT ACCOUNT (Default Auth = 3)
            sql.requestData(
                `INSERT INTO ${process.env.PROCESSING_DB}(cname, admin_id, admin_pw, authority, category1, campus)
                VALUES('${cname}', '${adminId}', '${hashedPassword}', 3, (SELECT CATEGORY FROM REG_REGIST WHERE ID=${targetId}), (SELECT CAMPUS FROM REG_REGIST WHERE ID=${targetId}));
                UPDATE REG_REGIST SET COMPLETED=1 WHERE ID=${targetId};`,
                null, (err, results) => {
                            if (err) {
                                console.log(err);
                                res.json({'RESULT':'FAIL'});
                            } else {
                                log.insertLogByCname(cname, log.getClientIp(req), 'SIGN_UP', 'REGULAR');
                                res.json({'RESULT':'SUCCESS'});
                            }
                        })
        })
    })


/**
 * 상시등록
 */
router
    .get('/extra', (req, res) => {
        res.render("regist_extra.ejs", {cname: req.user.cname? req.user.cname : null});
    })

router
    .post('/hasCode', (req, res) => {
        sql.requestData(`SELECT USED FROM CODES WHERE SUBJECT LIKE 'REGIST_EXTRA' AND CAMPUS LIKE ?;`, req.body.campus, (err, results) => {
            if(err){
                console.log(err);
                res.json({'RESULT' : 'FAIL'});
            } else {
                if(results[0].USED === 1)
                    res.json({'RESULT' : 'USE_CODE'});
                else
                    res.json({'RESULT' : 'NO_CODE'});
            }
        })
    })

router
    .post('/matchCodeExtra', (req, res) => {
        let campus = req.body.campus;
        let code = req.body.verif_code;

        sql.requestData(`SELECT CODE FROM CODES WHERE SUBJECT LIKE 'REGIST_EXTRA' AND CAMPUS LIKE ?;`, campus, (err, results) => {
            if(err){
                console.log(err);
                res.json({'RESULT' : 'FAIL'});
            } else {
                if(results[0].CODE === code)
                    res.json({'RESULT' : 'MATCHED'});
                else
                    res.json({'RESULT' : 'NOT_MATCHED'});
            }
        })
    })

router
    .post('/requestExtra', (req, res) => {
        const cname = req.body.cname;
        const campus = req.body.campus;
        const category1 = req.body.category1;
        const admin_id = req.body.admin_id;
        const admin_pw = req.body.admin_pw;
        const president_name = req.body.president_name;
        const president_contact = req.body.president_contact;
        
        /**@todo 시간되면 신청완료 log도 넣기 */
        // 비밀번호 해시적용
        encrypt.hashItem(admin_pw, (hashedPassword) => {
            sql.requestData(`
                INSERT INTO EXTRA_REGIST(CNAME, CAMPUS, CATEGORY1, ADMIN_ID, ADMIN_PW, PRESIDENT, CONTACT)
                VALUES('${cname}', '${campus}', '${category1}', '${admin_id}', '${hashedPassword}', '${president_name}', '${president_contact}');`,
                null, (err, results) => {
                    if(err){
                        console.log(err);
                        res.json({'RESULT' : 'FAIL'});    
                    } 
                    res.json({'RESULT' : 'SUCCESS'});
                })
        })
    })

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
    }


function dateDiff(_date1, _date2) {
    var diffDate_1 = _date1 instanceof Date ? _date1 :new Date(_date1);
    var diffDate_2 = _date2 instanceof Date ? _date2 :new Date(_date2);
    
    diffDate_1 = new Date(diffDate_1.getFullYear(), diffDate_1.getMonth()+1, diffDate_1.getDate());
    diffDate_2 = new Date(diffDate_2.getFullYear(), diffDate_2.getMonth()+1, diffDate_2.getDate());
    
    var diff = Math.abs(diffDate_2.getTime() - diffDate_1.getTime());
    diff = Math.floor(diff / (1000));   // 결과를 초단위로 받아 내림
    
    return diff;
}

module.exports = router;