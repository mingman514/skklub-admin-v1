if (process.env.NODE_ENV !== "production") {
  // 개발중이라면
  require("dotenv").config();
}

/*********************************************************
 * 
 * Modules
 * 
 *********************************************************/

// node_modules
const express = require("express");
const app = express();
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const cors = require("cors");
const helmet = require('helmet');

// custom_modules
const sql = require("./custom_modules/mysql-query");
const check = require('./custom_modules/check');



/********************************************************
 * 
 * Local DB
 * @deprecated
 ********************************************************/
// const users = require("./data/skklubDB.json");



/*********************************************************
 * 
 *  Router 
 * 
 *********************************************************/
const infoRouter = require('./routes/info');
const accountRouter = require('./routes/account');
const loginRouter = require('./routes/login');
const masterRouter = require('./routes/master');
const apiRouter = require('./routes/api');
const registerRouter = require('./routes/register');

const initializePassport = require("./custom_modules/passport-config");
initializePassport(passport);

  
app.use(cors());
app.set("views", __dirname + "/views");
app.set("view engine", "ejs"); // template engine setting
app.use(express.static(__dirname + "/public", { etag: false, maxAge: 0}));
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // 변한 것이 없을때도 재저장할 것인가?
    saveUninitialized: true, // 값이 없을때 empty value라도 저장하겠는가?
    cookie: {maxAge : 1000 * 60 * 60 * 12},  // 만료시간 설정
    rolling: true // reset expiration countdown whenever logged in
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(helmet()); // => CSP policy 위반에 따라 html 내 inline script 사용금지됨


app.get("/", check.checkAuthenticated, (req, res) => {
  let _category1 = req.user.category1;
  let _campus = req.user.campus;

  switch(_category1){
      case '중앙동아리':
        _category1 = 'central-clubs'; break;

      case '준중앙동아리':
      case '독립동아리':
        _category1 = 'independent-clubs'; break;

      case '소모임':
      case '준소모임':
        _category1 = 'groups'; break;
  }

  switch(_campus){
      case '명륜':
        _campus = 'seoul'; break;
      case '율전':
        _campus = 'suwon'; break;
  }

  res.render("index.ejs", {
    cname: req.user.cname,
    auth: req.user.authority,
    cid: req.user.cid,
    campus: _campus,
    category1: _category1
  });
});


// ROUTING
app.use('/info', check.checkAuthenticated, infoRouter);
app.use('/account', check.checkAuthenticated, accountRouter);
app.use('/login', loginRouter);
app.use('/master', check.checkMasterAuth, masterRouter);
app.use('/api', apiRouter);
app.use('/register', registerRouter);


app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});


// 404 NOT FOUND
app.use((req, res, next) => {
  res.status(404).send("<h2>[404] 요청한 페이지를 찾을 수 없습니다.</h2>");
});


app.listen(process.env.PORT, () => {
  console.log(`
  =============================================
                      |
    CURRENT DATABASE  |  ${process.env.PROCESSING_DB}
                      |
  =============================================
                      |
     Listening On..   |  http://localhost:${process.env.PORT}
                      |
  =============================================`)
});
