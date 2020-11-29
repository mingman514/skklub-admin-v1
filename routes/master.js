const express = require('express');
const router = express.Router();

const check = require('../public/js/check')
const sql = require("../public/js/mysql-query")
const encrypt = require('../public/js/encrypt')

// master
router.get("/", check.checkMasterAuth, (req, res) => {
      res.render("clublist.ejs", {
        cname: req.user.cname,
        auth: req.user.authority,
      });
  });


// Show Club List
router
    .post("/getClubList", check.checkMasterAuth, (req, res) => {
      // param 전달받아서 sql로 필터처리하는 부분 구현!
      let fcampus = req.body.campus;
      let fcategory = req.body.category;
      let fshow = req.body.show;
      let fedit = req.body.edit;
      let fsearchCategory = req.body.searchCategory;
      let fsearchKey = req.body.searchKey;

      var sqlWhere = "WHERE 1=1 ";
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
      
      sql.generalQuery(
        `SELECT cid, campus, cname, category1, category2, category3, president_name, president_contact, authority FROM ${process.env.PROCESSING_DB} ${sqlWhere}`,
        null,
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            let obj_result = { data: results };
            res.json(obj_result);
          }
        }
      );
    });


// Get Club Detail for Modal
router
    .post("/getClubDetail", check.checkMasterAuth, (req, res) => {
      let _cid = req.body.cid;
      console.log("cid = ", _cid);
      sql.generalQuery(
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
      sql.generalQuery(`SELECT ${reqColsSql} FROM ${process.env.PROCESSING_DB} WHERE cid=${_cid}`, null, (err, results) => {
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

      sql.generalQuery(`UPDATE ${process.env.PROCESSING_DB}
                        SET authority=${newauth}${categorySql}
                        WHERE cid IN (${targetSql})`, null, (err, results) => {
        if (err) {
          console.log(err);
          res.send('FAIL')
        } else {
          console.log(`UPDATE SUCCESS (${target.length} clubs => Auth "${newauth}")`)
          res.send('SUCCESS')
        }
      });
  })


router
  .post("/resetPassword", check.checkMasterAuth, (req, res) => {
    const _target = req.body.cid

    var newPassword = String(getRandomInt(100000, 999999));

    encrypt.hashItem(newPassword, (hashedPassword) => {
      
      sql.generalQuery(`UPDATE ${process.env.PROCESSING_DB}
                        SET admin_pw='${hashedPassword}'
                        WHERE cid=${_target}`, null, (err, results) => {
        if (err) {
          console.log(err);
          res.send('FAIL')
        } else {
          console.log(`RESET SUCCESS => ${newPassword}`)
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

    sql.generalQuery(backupSql + deleteSql, null, (err, results) => {
        if (err) {
          console.log(err);
          res.send('FAIL')
        } else {
          console.log(`DELETE and BACKUP SUCCESS`)
          res.send('DELETED')
        }
      });
  })





function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
  }


  module.exports = router;