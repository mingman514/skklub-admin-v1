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

/**
 * Local DB
 */
const users = require("./data/skklubDB.json");
const createJsonDb = require("./public/js/createDB");


/**
 *  Router 
 */
const infoRouter = require('./routes/info');
const accountRouter = require('./routes/account');
const loginRouter = require('./routes/login');
const masterRouter = require('./routes/master');



const initializePassport = require("./public/js/passport-config");
initializePassport(
  passport,
  (admin_id) => {
    return users.find((user) => user.admin_id === admin_id);
  },
  (cid) => {
    return users.find((user) => user.cid === cid);
  }
  );

  
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
    saveUninitialized: false, // 값이 없을때 empty value라도 저장하겠는가?
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));


app.get("/", check.checkAuthenticated, (req, res) => {
  res.render("index.ejs", { cname: req.user.cname, auth: req.user.authority });
});


// ROUTING
app.use('/info', infoRouter);
app.use('/account', accountRouter);
app.use('/login', loginRouter);
app.use('/master', masterRouter);



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


app.listen(process.env.PORT, () => {
  console.log(`listening on PORT http://localhost:${process.env.PORT}`);
});