if (process.env.NODE_ENV !== 'production') { // 개발중이라면
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt') // password hashing https://jungwoon.github.io/node.js/2017/08/07/bcrypt-nodejs/
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const users = require('./data/skklubDB.json')
const sql = require('./mysql-query')
const createJsonDb = require('./public/js/createDB')

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    admin_id => {
        return users.find(user => user.admin_id === admin_id)
    },
    cid => {
        return users.find(user => user.cid === cid)
    })

app.set('view-engine', 'ejs') // template engine setting
app.use( express.static( "public" ) );
app.use(express.urlencoded({ extended: false })) // https://velog.io/@yejinh/express-%EB%AF%B8%EB%93%A4%EC%9B%A8%EC%96%B4-bodyParser-%EB%AA%A8%EB%93%88
// express에 bodyParser 내장
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // 변한 것이 없을때도 재저장할 것인가?
    saveUninitialized: false // 값이 없을때 empty value라도 저장하겠는가?
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {
        cname: req.user.cname
    }) // redirect to 동헌's main page
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
            res.render('info.ejs', { result: results[0], cname: req.user.cname })
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
                    res.render('clubupdate.ejs', { result: results, cname: req.user.cname})
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
                console.log('3')
                createJsonDb()
                res.redirect('/info')
            }
        })
})

app.get('/account', checkAuthenticated, (req, res) => {
    res.render('account.ejs', {
        name: req.user.cname
    })
})

// https://www.skklub.com:3000/admin 통해서 들어온 요청 처리 (동헌이꺼에서 redirect('https://www.skklub.com:5000/login') 하기)
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => { // https://joshua1988.github.io/web-development/javascript/js-async-await/
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10) // 10 times hashing (default), await = asynchronous process
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            admin_id: req.body.admin_id,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(users)
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})


function checkAuthenticated(req, res, next) { // 로그인 안되어있으면 로그인페이지로
    if (req.isAuthenticated()) { // login success
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) { // 로그인 되어있으면 홈으로
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(process.env.PORT, () => {
    console.log(`listening on PORT ${process.env.PORT}`)
})