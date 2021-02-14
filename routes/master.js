const express = require('express');
const router = express.Router();

const check = require('../custom_modules/check')
const sql = require("../custom_modules/mysql-query")
const encrypt = require('../custom_modules/encrypt')
const log = require('../custom_modules/insertLog');

// master
router.get("/", check.checkMasterAuth, (req, res) => {
      res.render("master.ejs", {
        cname: req.user.cname,
        auth: req.user.authority,
      });
  });


// Show Club List
router
    .post("/getClubList", check.checkMasterAuth, (req, res) => {
      let fcampus = req.body.campus;
      let fcategory = req.body.category;
      let fshow = req.body.show;
      let fedit = req.body.edit;
      let fsearchCategory = req.body.searchCategory;
      let fsearchKey = req.body.searchKey;

      var sqlWhere = " ";
      if (fcampus) {
        sqlWhere += `AND campus LIKE '%${fcampus}%' `;
      }

      if (fcategory) {
        sqlWhere += `AND category1 LIKE '%${fcategory}%' `;
      }

      if (fshow) {
        if (fshow === "yes") {
          sqlWhere += `AND authority NOT IN (0, 2) `;
        } else if (fshow === "no") {
          sqlWhere += `AND authority IN (0, 2) `;
        }
      }

      if (fedit) {
        if (fedit === "yes") {
          sqlWhere += `AND authority NOT IN (0, 1) `;
        } else if (fedit === "no") {
          sqlWhere += `AND authority IN (0, 1) `;
        }
      }

      if (fsearchKey) {
        if (fsearchCategory === "contents") {
          sqlWhere += `AND (intro_text LIKE '%${fsearchKey}%' OR intro_sentence LIKE '%${fsearchKey}%' OR activity_info LIKE '%${fsearchKey}%')`;
        } else {
          sqlWhere += `AND ${fsearchCategory} LIKE '%${fsearchKey}%' `;
        }
      }

      // 마스터 세부 권한 필터
      if (req.user.authority > 3 && req.user.authority <= 6) {   // 중간관리자
        sqlWhere += `AND authority <= 3 AND campus LIKE '%${req.user.campus}%' `;
      } else if(req.user.authority > 6 && req.user.authority <= 8) {   // 동연관리자
        sqlWhere += `AND authority <= 6 AND campus LIKE '%${req.user.campus}%' `;
      }
      console.log(`
      ==========================
      SQL : ${sqlWhere}
      ==========================`);
      
      sql.requestData(
        `
        SELECT cid, campus, cname, category1, category2, category3, president_name, president_contact, authority
        FROM ${process.env.PROCESSING_DB}
        WHERE 1=1${sqlWhere}
        ORDER BY recent_change_date DESC;
        `,
        null,
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            let obj_result = {}
            obj_result.data = results;
            obj_result.auth = req.user.authority;
            res.json(obj_result);
          }
        }
      );
    });

router
    .post("/getActivityLog", check.checkMasterAuth, (req, res) => {
      var startIdx = req.body.start;
      var length = req.body.length;
      var draw = req.body.draw;
      
      var order_col_idx = req.body['order[0][column]']; // 정렬할 기준 컬럼 인덱스
      var order_col = req.body[`columns[${order_col_idx}][data]`]
      var order_dir = req.body['order[0][dir]'];
      var srch_col = req.body.srch_col;
      var srch_key = req.body.srch_key;
      
      sql.requestData(
        `
        -- requested data
        SELECT L.LOG_ID, L.LOG_CDE, L.ACTION_DETAIL, L.CID, L.CNAME, C.campus AS CAMPUS, date_format(L.TIME,'%Y-%m-%d %H:%i') AS TIME, L.USR_IP
        FROM ${process.env.LOG_DB} AS L
        LEFT OUTER JOIN (SELECT cid, campus FROM ${process.env.PROCESSING_DB}) AS C
        ON L.CID = C.cid
        WHERE CAMPUS LIKE '%${req.user.campus}%'${srch_key? ` AND ${srch_col} LIKE '%${srch_key}%'` : '' }
        ORDER BY ${order_col} ${order_dir} LIMIT ${length} OFFSET ${startIdx};

        -- recordsTotal
        SELECT COUNT(*) AS TOT_CNT FROM ${process.env.LOG_DB} AS L
        LEFT OUTER JOIN (SELECT cid, campus FROM ${process.env.PROCESSING_DB}) AS C
        ON L.CID = C.cid
        WHERE CAMPUS LIKE '%${req.user.campus}%';

        -- recordsFilter
        SELECT COUNT(*) AS FILT_CNT FROM ${process.env.LOG_DB} AS L
        LEFT OUTER JOIN (SELECT cid, campus FROM ${process.env.PROCESSING_DB}) AS C
        ON L.CID = C.cid
        WHERE CAMPUS LIKE '%${req.user.campus}%'${srch_key? ` AND ${srch_col} LIKE '%${srch_key}%'` : '' }
        `,
        null,
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            let obj_result = {
              draw : draw,
              recordsTotal : results[1][0].TOT_CNT,
              recordsFiltered : results[2][0].FILT_CNT,
              data : results[0],
              auth : req.user.authority
            }

            res.json(obj_result);
          }
        }
      );
    })


// Get Club Detail for Modal
router
    .post("/getClubDetail", check.checkMasterAuth, (req, res) => {
      let _cid = req.body.cid;
      console.log("cid = ", _cid);
      sql.requestData(
        `SELECT *,
                date_format(recent_change_date,'%Y-%m-%d %H:%i') AS rec_chg_date,
                date_format(registration_date,'%Y-%m-%d %H:%i') AS reg_date
        FROM ${process.env.PROCESSING_DB}
        WHERE cid=${_cid}`, null, (err, results) => {
          if (err) {
            console.log(err);
          } else {
            res.json(results)
          }
        }
      );
    })



// Get Specific Columns
router
    .post("/getTargetFeature", check.checkMasterAuth, (req, res) => {
      let _cid = req.body.cid;
      let reqCols = req.body.reqColumn.split(','); // 배열을 string 형태로 전송하므로 split으로 배열화 시켜줌
      let reqColsSql = '';
      if(reqCols){
        for(var i in reqCols){
          reqColsSql += reqCols[i] + ','
        }
        reqColsSql = reqColsSql.substr(0, reqColsSql.length -1);
      }
      sql.requestData(`SELECT ${reqColsSql} FROM ${process.env.PROCESSING_DB} WHERE cid=${_cid}`, null, (err, results) => {
          if (err) {
            console.log(err);
          } else {
            res.json(results)
          }
        }
      );
    })


// Update Authority (Switch)
router
    .post("/update", check.checkMasterAuth, (req, res) => {
      let categorySql = '';
      if(req.body.category1){
        categorySql = `, category1='${req.body.category1}'`;
      }
      const newauth = req.body.newauth;
      let target = req.body.target;               // target이 1개면 string으로, 여러개면 array로 넘어옴
      if(Array.isArray(target) === false){
        target = target.split(',');
      }
      let targetSql = ''
      if(target){
        for(var i in target){
          targetSql += target[i] + ','
        }
        targetSql = targetSql.substr(0, targetSql.length -1);
      }

      sql.requestData(`UPDATE ${process.env.PROCESSING_DB}
                        SET authority=${newauth}${categorySql}
                        WHERE cid IN (${targetSql})`, null, (err, results) => {
        if (err) {
          console.log(err);
          res.send('FAIL')
        } else {
          console.log(`UPDATE SUCCESS (${target.length} clubs => Auth "${newauth}")`)

          log.insertLogByCid(req.user.cid, log.getClientIp(req),'CHANGE_AUTH', target + ` (auth ${newauth}${req.body.category1? '/'+ req.body.category1 : ''})`);   // write log
          res.send('SUCCESS')
        }
      });
  })


router
  .post("/resetPassword", check.checkMasterAuth, (req, res) => {
    const _target = req.body.cid

    var newPassword = String(getRandomInt(100000, 999999));

    encrypt.hashItem(newPassword, (hashedPassword) => {
      
      sql.requestData(`UPDATE ${process.env.PROCESSING_DB}
                        SET admin_pw='${hashedPassword}'
                        WHERE cid=${_target}`, null, (err, results) => {
        if (err) {
          console.log(err);
          res.send('FAIL')
        } else {
          console.log(`RESET SUCCESS => ${newPassword}`)

          log.insertLogByCid(req.user.cid, log.getClientIp(req),'RESET_PW', String(_target));   // write log
          res.send(newPassword)
        }
      });
    })
  })


router
  .post("/deleteAccount", check.checkMasterAuth, (req, res) => {
    const _target = req.body.cid

    const backupSql = `INSERT INTO DELETED_CLUB SELECT * FROM ${process.env.PROCESSING_DB} WHERE cid=${_target};`
    const deleteSql = `DELETE FROM ${process.env.PROCESSING_DB} WHERE cid=${_target};`

    sql.requestData(backupSql + deleteSql, null, (err, results) => {
        if (err) {
          console.log(err);
          res.send('FAIL')
        } else {
          console.log(`DELETE and BACKUP SUCCESS`)

          log.insertLogByCid(req.user.cid, log.getClientIp(req),'DELETE_CLUB', String(_target));   // write log
          res.send('DELETED')
        }
      });
  })

router
  .post('/delete-log', check.checkMasterAuth, (req, res) => {
    const logId = req.body.logId;

    sql.requestData(`DELETE FROM ${process.env.LOG_DB} WHERE LOG_ID=?`, logId, (err, results) => {
      if(err){
        console.log(err);
        res.json({ 'RESULT' : 'FAIL'} );
      } else {
        res.json({ 'RESULT' : 'SUCCESS'} );
      }
    })
  })





function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
  }


  module.exports = router;