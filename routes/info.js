const express = require('express');
const router = express.Router();


const fs = require('fs');
const sql = require("../custom_modules/mysql-query");
const check = require('../custom_modules/check')
const log = require('../custom_modules/insertLog');
// const sharp = require('sharp')
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
    
    var date = new Date();
    var mth = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();
    var hh = date.getHours();
    var mm = date.getMinutes();

    var fullDate = [date.getFullYear(),
                    (mth>9 ? '' : '0') + mth,
                    (dd>9 ? '' : '0') + dd,
                    '_',
                    (hh>9 ? '' : '0') + hh,
                    (mm>9 ? '' : '0') + mm
                  ].join('');

    cb(null, fullDate + '_' + _cid + '.' + mimeType)

    // cb(null, _cid + '.' + mimeType) // 전송된 파일 이름 설정
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
            cname: req.user.cname,
            auth: req.user.authority,
          });
        }
      }
    )
  })
  .post(check.checkAuthenticated, check.checkEditable, (req, res) => {
    // TEXT UPDATE
    var updateSql = "";
    
    for (var key in req.body) {
      if(['logoUpload', 'category1', 'campus'].includes(key)) continue;
      updateSql += `${key}='${escapeQuotes(req.body[key])}', `;
    }

    updateSql = `UPDATE ${process.env.PROCESSING_DB} SET ${updateSql.slice(0, -2)} WHERE cid=${req.user.cid};`;

    sql.generalQuery(updateSql, null, (err, results) => {
      if (err) {
        console.log(err);
      } else {

        log.insertLogByCid(req.user.cid, log.getClientIp(req),'EDIT_INFO', '');    // write log
        res.redirect("/info");
      }
    })
  })



  // DB반영 추가!!
// LOGO UPDATE
router
  .route("/update/logo")
  .post(check.checkAuthenticated, check.checkEditable, upload.single('logoUpload'), (req, res) => {
    var fileName = req.file.filename;

    sql.generalQuery(
      `SELECT logo_path FROM ${process.env.PROCESSING_DB} WHERE cid=${req.user.cid};
      UPDATE ${process.env.PROCESSING_DB} SET logo_path='${fileName}' WHERE cid= ${req.user.cid};`,
      null,
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          // 기존파일 삭제
          try {
            fs.unlinkSync('public/img/logo/' + results[0][0].logo_path);
            console.log(`successfully deleted file [${results[0][0].logo_path}]`);
          } catch (err) {
            // handle the error
            console.log('Delete Fail')
            console.log(err)
          }

          log.insertLogByCid(req.user.cid, log.getClientIp(req), 'UPLOAD_FILE', fileName);    // write log
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

/**
 * This is for Second-hand Query. Using "\" may work in direct SQL,
 * but if you need to process your SQL before querying, then this function may work.
 */
function escapeQuotes(txtContent){
  txtContent = txtContent.replace(/'/gi,"\\'");
  txtContent = txtContent.replace(/"/gi,'\\"');
  return txtContent;
}

/*
// Image crop func (* input path != output path)
function resizeImg(inputFilePath, outputFilePath, cb){
  sharp(inputFilePath).resize({ height:600, width:600}).toFile(outputFilePath)
    .then(function(newFileInfo){
      console.log("Image Resized");
      cb();
    })
    .catch(function(err){
      console.log(err);
});
} */

module.exports = router;