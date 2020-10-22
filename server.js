if (process.env.NODE_ENV !== "production") {
  // 개발중이라면
  require("dotenv").config();
}

/* Modules */
const express = require("express");
const app = express();
const bcrypt = require("bcrypt"); // password hashing https://jungwoon.github.io/node.js/2017/08/07/bcrypt-nodejs/
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const users = require("./data/skklubDB.json");
const sql = require("./public/js/mysql-query");
const createJsonDb = require("./public/js/createDB");
const data = require("./data/skklubDB.json")

/* To-do: Router 분리작업 */

const initializePassport = require("./passport-config");
initializePassport(
  passport,
  (admin_id) => {
    return users.find((user) => user.admin_id === admin_id);
  },
  (cid) => {
    return users.find((user) => user.cid === cid);
  }
);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs"); // template engine setting
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false })); // https://velog.io/@yejinh/express-%EB%AF%B8%EB%93%A4%EC%9B%A8%EC%96%B4-bodyParser-%EB%AA%A8%EB%93%88
// express에 bodyParser 내장
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // 변한 것이 없을때도 재저장할 것인가?
    saveUninitialized: false, // 값이 없을때 empty value라도 저장하겠는가?
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { cname: req.user.cname, auth: req.user.authority }) // redirect to 동헌's main page
})

// 동아리정보 뷰
app.get('/info', checkAuthenticated, (req, res) => {
    sql.searchResult(req.user.cid, 'cid', (err, results) => {
        // console.log(`result : ${results[0]['cid']}`)
        if (err) {
            console.log(err)
            res.redirect('/')
        } else {
            // console.log('worked!\nresults:' + JSON.stringify(results[0]))
            res.render('info.ejs', { result: results[0], cname: req.user.cname, auth: req.user.authority })
        }
    })
})
// 동아리정보 수정
app.get('/info/update', checkAuthenticated, (req, res) => {
    sql.generalQuery(`select * from club where cid= ?;` + `select distinct category1 from club;` + `select distinct category2 from club;`,[req.user.cid], (err, results) => {
        if (err) {
                    console.log(err)
                    res.redirect('/info')
                } else {
                    res.render('clubupdate.ejs', { result: results, cname: req.user.cname, auth: req.user.authority})
                }
    })
})

app.post('/info/update', checkAuthenticated, (req, res) => {
    //var columnList = ['cname', 'category1', 'category2', 'category3', 'campus', 'estab_year', 'intro_text', 'intro_sentence', 'activity_info', 'meeting_time', 'activity_location', 'activity_num', 'recruit_season', 'activity_period', 'recruit_process', 'recruit_num', 'recruit_site', 'president_name', 'president_contact', 'emergency_contact']
        var updateSql = ''
        for(var key in req.body){
            updateSql += `${key}='${req.body[key]}', `
        }
        updateSql = `UPDATE club SET ` + updateSql.slice(0, -2) + ` WHERE cid=${req.user.cid}`
        sql.generalQuery(updateSql, null, (err, results) => {
            if (err) {
                console.log(err)
            } else {
                createJsonDb() // 세션정보 사라짐(writefile로 파일이 수정돼서 nodemon reload 작동)
                msg = `${req.user.cname}의 정보가 변경되었습니다.\n다시 로그인해주세요.`
                req.flash('flash',msg)
                res.render('login.ejs')
            }
        })
})

app.get('/account', checkAuthenticated, (req, res) => {
    res.render('account.ejs', {cname: req.user.cname, flash: '', auth: req.user.authority })
})
app.post('/account', checkAuthenticated, (req, res) => {
    var pw1 = req.body.pw1
    var pw2 = req.body.pw2
    var msg = ''
    if(pw1 !== pw2){
         msg += '변경할 비밀번호를 일치시켜주세요.\n'

    }
  });
// 동아리정보 수정
app.get("/info/update", checkAuthenticated, (req, res) => {
  sql.generalQuery(
    `select * from club where cid= ?;` +
      `select distinct category1 from club;` +
      `select distinct category2 from club;`,
    [req.user.cid],
    (err, results) => {
      if (err) {
        console.log(err);
        res.redirect("/info");
      } else {
        res.render("clubupdate.ejs", {
          result: results,
          cname: req.user.cname,
        });
      }
    }
  );
});

app.post("/info/update", checkAuthenticated, (req, res) => {
  //var columnList = ['cname', 'category1', 'category2', 'category3', 'campus', 'estab_year', 'intro_text', 'intro_sentence', 'activity_info', 'meeting_time', 'activity_location', 'activity_num', 'recruit_season', 'activity_period', 'recruit_process', 'recruit_num', 'recruit_site', 'president_name', 'president_contact', 'emergency_contact']
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
  });
});

app.get("/account", checkAuthenticated, (req, res) => {
  res.render("account.ejs", { cname: req.user.cname, flash: "" });
});
app.post("/account", checkAuthenticated, (req, res) => {
  var pw1 = req.body.pw1;
  var pw2 = req.body.pw2;
  var msg = "";
  if (pw1 !== pw2) {
    msg += "변경할 비밀번호를 일치시켜주세요.\n";
  } else if (pw1.length < 6 || pw1.length > 20) {
    msg += "6자리 ~ 20자리 이내로 입력해주세요.\n";
  } else if (pw1.search(/\s/) != -1) {
    msg += "비밀번호에 공백은 포함될 수 없습니다.\n";
  }
  if (msg) {
    req.flash("flash", msg);
    res.redirect("/account");
  } else {
    // 비밀번호 암호화과정 추가
    var _bcrypt = async function (sql) {
      try {
        const hashedPassword = await bcrypt.hash(pw1, 10);
        sql(hashedPassword);
      } catch {
        let msg = "Bcrypt Error! 관리자에게 문의하세요.";
        req.flash("flash", msg);
        res.redirect("/account");
      }
    };
    _bcrypt((hashedPassword) => {
      sql.generalQuery(
        "UPDATE club SET admin_pw=? WHERE cid=?",
        [hashedPassword, req.user.cid],
        (err, results) => {
          if (err) {
            console.log(err);
            msg = "DB UPDATE Query Error! 관리자에게 문의하세요.";
            req.flash("flash", msg);
            res.redirect("/account");
          } else {
            createJsonDb();
            msg = `${req.user.cname}의 계정 비밀번호가 변경되었습니다.\n다시 로그인해주세요.`;
            req.flash("flash", msg);
            res.render("login.ejs");
          }
        }
      );
    });
  }
});

// https://www.skklub.com:3000/admin 통해서 들어온 요청 처리 (동헌이꺼에서 redirect('https://www.skklub.com:5000/login') 하기)
app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// register 구현 아직
app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
  // https://joshua1988.github.io/web-development/javascript/js-async-await/
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // 10 times hashing (default), await = asynchronous process
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      admin_id: req.body.admin_id,
      password: hashedPassword,
    });
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
  console.log(users);
});

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

function checkAuthenticated(req, res, next) {
  // 로그인 안되어있으면 로그인페이지로
  if (req.isAuthenticated()) {
    // login success
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  // 로그인 되어있으면 홈으로
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.listen(process.env.PORT, () => {
    console.log(`listening on PORT http://localhost:${process.env.PORT}`)
})

