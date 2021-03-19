const express = require('express');
const router = express.Router();

const fs = require('fs');
const check = require('../custom_modules/check')
const sql = require("../custom_modules/mysql-query")
const encrypt = require('../custom_modules/encrypt')
const log = require('../custom_modules/insertLog');
const { insertLogByCid } = require('../custom_modules/insertLog');

// master
router.get("/", (req, res) => {
      res.render("master.ejs", {
        cname: req.user.cname,
        auth: req.user.authority,
      });
  });

// Open Tab
router.post("/openTab", (req, res) => {
  const tabName = req.body.tabName;
  const filePath = __dirname + `/../views/partials/master/tab_${tabName}.html`;

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if(err){
      console.log(err);
      res.json({'RESULT' : 'FAIL'});
    } else {
      /**
       * @author mingman
       * @since 2021-02-21
       * Tabs did not work properly when clicked.
       * Html loaded successfully, but JS file excuted once.
       * Cached file was the problem, so need to load new file.
       * Therefore, dynamically add random charaters at the end.
       * Be careful with file names and tab texts.
       * (If you find a better way, try that instead!)
       */
      data += `<script type="module" src="/js/master_tab_${tabName}.js?version=${Math.random().toString(36).substr(2,11)}"></script>`
      res.json({'RESULT' : 'SUCCESS', 'HTML' : data});
    }
  })
})


/***********************************
 * Clubs Tab
 ***********************************/
// Show Club List
router
    .post("/getClubList", (req, res) => {
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
      sqlWhere += masterDetailedFilter(req.user.authority, req.user.campus,'authority', 'campus');

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

// Get Club Detail for Modal
router
    .post("/getClubDetail", (req, res) => {
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
    .post("/getTargetFeature", (req, res) => {
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
    .post("/update", (req, res) => {
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
  .post("/resetPassword", (req, res) => {
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
  .post("/deleteAccount", (req, res) => {
    const _target = req.body.cid

    sql.requestData(`SELECT authority AS AUTH FROM ${process.env.PROCESSING_DB} WHERE cid=${_target}`, null, (err, results) => {
      if(err){
        console.log(err);
        res.json({'RESULT' : 'FAIL'});
      } else {
        if(results[0].AUTH >= req.user.authority){
          res.json({'RESULT' : 'UNAUTHORIZED'});
        } else {

          const backupSql = `INSERT INTO DELETED_CLUB SELECT * FROM ${process.env.PROCESSING_DB} WHERE cid=${_target};`
          const deleteSql = `DELETE FROM ${process.env.PROCESSING_DB} WHERE cid=${_target};`
          
          sql.requestData(backupSql + deleteSql, null, (err, results) => {
            if (err) {
              console.log(err);
              res.json({'RESULT' : 'FAIL'});
            } else {
              console.log(`DELETE and BACKUP SUCCESS`)
              
              log.insertLogByCid(req.user.cid, log.getClientIp(req),'DELETE_CLUB', String(_target));   // write log
              res.json({'RESULT' : 'SUCCESS'});

            }
          });
        }
      }
    })
  })
/***********************************
 * Manage Tab
 ***********************************/
router
  .post('/getCodeInfo', (req, res) => {
    sql.requestData(`SELECT CODE, USED, CAMPUS FROM CODES WHERE SUBJECT LIKE 'REGIST_EXTRA';`, null, (err, results) => {
      if(err){
        console.log(err);
        res.json({'RESULT' : 'FAIL'});
      } else {
        res.json({'RESULT' : 'SUCCESS', 'INFO' : results, 'CAMPUS' : req.user.campus });
      }
    })
  })

router
  .post('/changeCode', (req, res) => {
    const campus = req.body.campus;
    const code = req.body.code;

    sql.requestData(`UPDATE CODES SET CODE=? WHERE CAMPUS LIKE ?;`, [code, campus], (err, results) => {
      if(err){
        console.log(err);
        res.json({'RESULT' : 'FAIL'});
      } else {
        res.json({'RESULT' : 'SUCCESS'});
      }
    })
  })

router
  .post('/getRegistList', (req, res) => {
    let SQL = `
          SELECT *
          FROM (SELECT
                      @ROWNUM := @ROWNUM + 1 AS ROWNUM,
                      ID, CNAME, CATEGORY1, CAMPUS, PRESIDENT, CONTACT, date_format(REGIST_TIME,'%Y-%m-%d %H:%i') AS REGIST_TIME
                FROM EXTRA_REGIST, (SELECT @ROWNUM := 0) TMP
                WHERE 1=1 
                ${req.user.authority < 8? ` AND CAMPUS LIKE '${req.user.campus}'`: ''}
                ORDER BY REGIST_TIME ASC) SUB
          ORDER BY SUB.ROWNUM DESC;
          `;

    sql.requestData(SQL, null, (err, results) => {
      if (err) {
        console.log(err);
      } else {
        let obj_result = {}
        obj_result.data = results;
        obj_result.auth = req.user.authority;
        res.json(obj_result);
      }
    })

  })

router
  .post('/changeCodeUse', (req, res) => {
    const campus = req.body.campus;
    const use = req.body.use;

    sql.requestData(`UPDATE CODES SET USED=? WHERE CAMPUS LIKE ?;`, [use, campus], (err, results) => {
      if(err){
        console.log(err);
        res.json({'RESULT' : 'FAIL'});
      } else {
        res.json({'RESULT' : 'SUCCESS'});
      }
    })
  })

router
  .post('/approveClub', (req, res) => {
    const registId = req.body.registId;
    const cname = req.body.cname;

    let SQL = `
              INSERT INTO ${process.env.PROCESSING_DB}
              (cname, category1, campus, president_name, president_contact, admin_id, admin_pw, authority)
                  SELECT CNAME, CATEGORY1, CAMPUS, PRESIDENT, CONTACT, ADMIN_ID, ADMIN_PW, 3
                  FROM EXTRA_REGIST
                  WHERE ID=?;
              `
    sql.requestData(SQL, registId, (err, results) => {
      if(err){
        console.log(err);
        res.json({'RESULT' : 'FAIL'});
      } else {
        // delete regist data
        sql.requestData('DELETE FROM EXTRA_REGIST WHERE ID=?', registId, (err, results) => {
          if(err){
            console.log(err);
            res.json({'RESULT' : 'FAIL'});
          } else {
            log.insertLogByCname(req.user.cname, log.getClientIp(req), 'APPROVE_CLUB', `${cname} 승인`);
            res.json({'RESULT' : 'SUCCESS'})
          }
        })
      }
    })
  })

router
  .post('/rejectClub', (req, res) => {
    const registId = req.body.registId;
    const cname = req.body.cname;

    sql.requestData('DELETE FROM EXTRA_REGIST WHERE ID=?', registId, (err, results) => {
      if(err){
        console.log(err);
        res.json({'RESULT' : 'FAIL'});
      } else {
        log.insertLogByCname(req.user.cname, log.getClientIp(req), 'REJECT_CLUB', `${cname} 반려`);
        res.json({'RESULT' : 'SUCCESS'})
      }
    })
  })
/***********************************
 * Log Tab
 ***********************************/
router
  .post("/getActivityLog", (req, res) => {
    var startIdx = req.body.start;
    var length = req.body.length;
    var draw = req.body.draw;
    
    var order_col_idx = req.body['order[0][column]']; // 정렬할 기준 컬럼 인덱스
    var order_col = req.body[`columns[${order_col_idx}][data]`]
    var order_dir = req.body['order[0][dir]'];
    var srch_col = req.body.srch_col;
    var srch_key = req.body.srch_key;

    var master_filter = masterSelfFilter(req.user.authority, req.user.campus, 'C.authority', 'CAMPUS'); // 권한 + 1은 활동로그 조회 시에 자신의 로그를 보기 위함

    sql.requestData(
      `
      -- requested data
      SELECT L.LOG_ID, L.LOG_CDE, L.ACTION_DETAIL, L.CID, L.CNAME, C.campus AS CAMPUS, C.authority AS AUTH, date_format(L.TIME,'%Y-%m-%d %H:%i') AS TIME, L.USR_IP
      FROM ${process.env.LOG_DB} AS L
      LEFT OUTER JOIN (SELECT cid, campus, authority FROM ${process.env.PROCESSING_DB}) AS C
      ON L.CID = C.cid
      WHERE 1=1 ${master_filter}
      ${srch_key? ` AND ${srch_col} LIKE '%${srch_key}%'` : '' }
      ORDER BY ${order_col} ${order_dir} LIMIT ${length} OFFSET ${startIdx};

      -- recordsTotal
      SELECT COUNT(*) AS TOT_CNT FROM ${process.env.LOG_DB} AS L
      LEFT OUTER JOIN (SELECT cid, campus, authority FROM ${process.env.PROCESSING_DB}) AS C
      ON L.CID = C.cid
      WHERE 1=1 ${master_filter};

      -- recordsFilter
      SELECT COUNT(*) AS FILT_CNT FROM ${process.env.LOG_DB} AS L
      LEFT OUTER JOIN (SELECT cid, campus, authority FROM ${process.env.PROCESSING_DB}) AS C
      ON L.CID = C.cid
      WHERE 1=1 ${master_filter}
      ${srch_key? ` AND ${srch_col} LIKE '%${srch_key}%'` : '' }
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

router
  .post('/delete-log', (req, res) => {
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

/**
 * 스스로 자기계정을 삭제하는 등 치명적인 오류 예상시,
 * 자신이 목록에 뜨지 않도록 하는 필터
 */
function masterDetailedFilter(auth, campus, authTxt, campusTxt){
  let sql = '';
  if (auth > 3 && auth <= 6) {   // 중간관리자
    sql += ` AND ${authTxt} <= 3 AND ${campusTxt} LIKE '%${campus}%' `;
  } else if(auth == 7) {   // 동연관리자
    sql += ` AND ${authTxt} <= 6 AND ${campusTxt} LIKE '%${campus}%' `;
  } else if(auth == 8) {   // 기지위 서브관리자
    sql += ` AND ${authTxt} <= 7 `;
  }
  return sql;
}

/**
 * 조회 등에서 자기 계정까지 포함하고 싶을때
 */
function masterSelfFilter(auth, campus, authTxt, campusTxt){
  let sql = '';
  if (auth > 3 && auth <= 6) {   // 중간관리자
    sql += ` AND ${authTxt} <= 6 AND ${campusTxt} LIKE '%${campus}%' `;
  } else if(auth == 7) {   // 동연관리자
    sql += ` AND ${authTxt} <= 7 AND ${campusTxt} LIKE '%${campus}%' `;
  } else if(auth == 8) {   // 기지위 서브관리자
    sql += ` AND ${authTxt} <= 8 `;
  }
  return sql;
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
  }


  module.exports = router;