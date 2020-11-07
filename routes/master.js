const express = require('express');
const router = express.Router();

const check = require('../public/js/check')
const sql = require("../public/js/mysql-query");

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
        sqlWhere += `AND campus like '%${fcampus}%' `;
      }

      if (fcategory) {
        sqlWhere += `AND category1='${fcategory}' `;
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
      console.log("===================", sqlWhere);
            // ****  TEST DB에 적용중 *****
      sql.generalQuery(
        `SELECT cid, campus, cname, category1, category2, category3, president_name, president_contact, authority FROM club_test ${sqlWhere}`,
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
        FROM club_test
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
      sql.generalQuery(`SELECT ${reqColsSql} FROM club_test WHERE cid=${_cid}`, null, (err, results) => {
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
    .post("/updateAuth", check.checkMasterAuth, (req, res) => {
      let newauth = req.body.newauth;
      let target = req.body.target.split(',');
      let targetSql = ''
      if(target){
        for(var i in target){
          targetSql += target[i] + ','
        }
        targetSql = targetSql.substr(0, targetSql.length -1);
      }

      sql.generalQuery(`UPDATE club_test SET authority=${newauth} WHERE cid IN (${targetSql})`, null, (err, results) => {
        if (err) {
          console.log(err);
          res.send('FAIL')
        } else {
          console.log(`UPDATE SUCCESS (${target.length} clubs => Auth "${newauth}")`)
          res.send('SUCCESS')
        }
      }
    );
  })





  module.exports = router;