const express = require('express');
const router = express.Router();


const sql = require("../public/js/mysql-query");
const check = require('../public/js/check')
const createJsonDb = require("../public/js/createDB");   // needs update
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
    cb(null, _cid + '.' + mimeType) // 전송된 파일 이름 설정
  }
})
const upload = multer({ storage: storage })

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
      `select * from club where cid= ?;` + `select distinct category1 from club;` + `select distinct category2 from club;`,
      [req.user.cid],
      (err, results) => {
        if (err) {
          console.log(err);
          res.redirect("/info");
        } else {
          res.render("clubupdate.ejs", {
            result: results,
            cname: req.user.cname,
            auth: req.user.authority,
          });
        }
      }
    )
  })
  .post(check.checkAuthenticated, upload.single('logoUpload'), (req, res) => {
    // FILE UPDATE
    


    // TEXT UPDATE
    var updateSql = "";
    for (var key in req.body) {
      updateSql += `${key}='${req.body[key]}', `;
    }
    updateSql =
      `UPDATE club SET ` + updateSql.slice(0, -2) + ` WHERE cid=${req.user.cid}`;
    sql.generalQuery(updateSql, null, (err, results) => {
      if (err) {
        console.log(err);
      } else {
        createJsonDb(); // 세션정보 사라짐(writefile로 파일이 수정돼서 nodemon reload 작동)
        msg = `${req.user.cname}의 정보가 변경되었습니다.\n다시 로그인해주세요.`;
        req.flash("flash", msg);
        res.render("login.ejs");
      }
    })
  })




module.exports = router;