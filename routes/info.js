const express = require('express');
const router = express.Router();


const sql = require("../public/js/mysql-query");
const check = require('../public/js/check')
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/logo/') // 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {

    var _cid = req.user.cid;
    var mimeType;

    switch (file.mimetype) {
      case "image/jpeg":
        mimeType = "jpg";
      break;
      case "image/png":
        mimeType = "png";
      break;
      case "image/gif":
        mimeType = "gif";
      break;
      case "image/bmp":
        mimeType = "bmp";
      break;
      default:
        mimeType = "jpg";
      break;
    }
    /*
    var date = new Date();
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();
    var hh = date.getHours();
    var mm = date.getDate();

    var fullDate = [date.getFullYear(),
                    (mm>9 ? '' : '0') + mm,
                    (dd>9 ? '' : '0') + dd,
                    '_',
                    (hh>9 ? '' : '0') + hh,
                    (mm>9 ? '' : '0') + mm
                  ].join('');
                  */                          // **** 나중에 여러 이미지 관리시를 대비
    // cb(null, fullDate + '_' + _cid + '.' + mimeType)

    cb(null, _cid + '.' + mimeType) // 전송된 파일 이름 설정
  }
})
const upload = multer({ 
  storage: storage
}); // 용량제한 시 에러핸들링 위해 직접 실행

// info
router.get("/", check.checkAuthenticated, (req, res) => {
    sql.searchResult(req.user.cid, "cid", (err, results) => {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        res.render("info.ejs", {
          result: results[0],
          cname: req.user.cname,
          auth: req.user.authority,
        });
      }
    });
  });

// info/update
router
  .route("/update")
  .get(check.checkAuthenticated, (req, res) => {
    sql.generalQuery(
      // `SELECT * FROM ${process.env.PROCESSING_DB} WHERE cid= ?;` + `SELECT DISTINCT category1 FROM ${process.env.PROCESSING_DB};` + `SELECT DISTINCT category2 FROM ${process.env.PROCESSING_DB};`,
      `SELECT * FROM ${process.env.PROCESSING_DB} WHERE cid= ?;`,
      [req.user.cid],
      (err, results) => {
        if (err) {
          console.log(err);
          res.redirect("/info");
        } else {

          res.render("clubupdate.ejs", {
            result: results[0],
            // user : req.user     // passport-config.js의 getUserByColumn 함수의 쿼리결과
          });
        }
      }
    )
  })
  .post(check.checkAuthenticated, (req, res) => {
    // TEXT UPDATE
    var updateSql = "";
    for (var key in req.body) {
      if(['logoUpload', 'category2_1', 'category2_2'].includes(key)) continue;
      updateSql += `${key}='${req.body[key]}', `;
    }
    updateSql = `UPDATE ${process.env.PROCESSING_DB} SET ${updateSql.slice(0, -2)} WHERE cid=${req.user.cid};`;
    // category2 직접 추가
    let comma = req.body.category2_1 && req.body.category2_2 ? ', ' : '';
    updateSql += `UPDATE ${process.env.PROCESSING_DB}
                  SET category2='${blankIfNotExist(req.body['category2_1']) + comma + blankIfNotExist(req.body['category2_2'])}'
                  WHERE cid=${req.user.cid};`
    sql.generalQuery(updateSql, null, (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/info");
      }
    })
  })



  // DB반영 추가!!
// LOGO UPDATE
router
  .route("/update/logo")
  .post(check.checkAuthenticated, upload.single('logoUpload'), (req, res) => {
    sql.generalQuery(
      `UPDATE ${process.env.PROCESSING_DB} SET logo_path='${req.file.filename}' WHERE cid= ?;`,
      [req.user.cid],
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          res.json({SUCCESS: 'success'});
        }
      })
})



function blankIfNotExist(str){
  if(str === null || str === undefined){
    return '';
  }
  return str;
}

module.exports = router;