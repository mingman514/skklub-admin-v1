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
const upload = multer({ 
  storage: storage, 
  limits: { fileSize : 256 * 1024 } // 256KB로 크기 제한
}).single('logoUpload'); // 용량제한 시 에러핸들링 위해 직접 실행

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
      `select * from CLUB where cid= ?;` + `select distinct category1 from CLUB;` + `select distinct category2 from CLUB;`,
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
  .post(check.checkAuthenticated, (req, res) => {
    // FILE UPDATE
    upload(req, res, function(err){
      if(err){
        msg = `로고 업로드 중 오류가 발생하였습니다. 이미지 크기는 256KB를 넘기지 말아주세요.\n${err}`;
        req.flash("flash", msg);
        res.render("login.ejs");
      }
    })

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