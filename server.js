if (process.env.NODE_ENV !== "production") {
  // 개발중이라면
  require("dotenv").config();
}

/**
 * Modules
 */
const express = require("express");
const app = express();
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const sql = require("./public/js/mysql-query");
const cors = require("cors");
const check = require('./public/js/check')
const helmet = require('helmet')

/**
 * Local DB
 */
// const users = require("./data/skklubDB.json");

/**
 *  Router 
 */
const infoRouter = require('./routes/info');
const accountRouter = require('./routes/account');
const loginRouter = require('./routes/login');
const masterRouter = require('./routes/master');
const apiRouter = require('./routes/api');
const registerRouter = require('./routes/register');



const initializePassport = require("./public/js/passport-config");
initializePassport(passport);

  
app.use(cors());
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
    saveUninitialized: true, // 값이 없을때 empty value라도 저장하겠는가?
    cookie: {maxAge : 1000 * 60 * 60 * 3},  // 만료시간 설정
    rolling: true // reset expiration countdown whenever logged in
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
// app.use(helmet()); => CSP policy 위반에 따라 html 내 inline script 사용금지됨


app.get("/", check.checkAuthenticated, (req, res) => {
  res.render("index.ejs", { cname: req.user.cname, auth: req.user.authority });
});


// ROUTING
app.use('/info', infoRouter);
app.use('/account', accountRouter);
app.use('/login', loginRouter);
app.use('/master', masterRouter);
app.use('/api', apiRouter);
app.use('/register', registerRouter);



// register 구현 아직
app.get("/register", check.checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.post("/register", check.checkNotAuthenticated, async (req, res) => {
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


// 404 NOT FOUND
app.use((req, res, next) => {
  res.status(404).send("<h2>[404] 요청한 페이지를 찾을 수 없습니다.</h2>");
});


app.listen(process.env.PORT, () => {
  console.log(`listening on PORT http://localhost:${process.env.PORT}`);
  console.log(`CURRENT DATABASE : ${process.env.PROCESSING_DB}`)
});
