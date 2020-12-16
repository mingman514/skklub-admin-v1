const LocalStrategy = require('passport-local').Strategy
const sql = require("./mysql-query");
const encrypt = require('./encrypt')

function initialize(passport){
    const authenticateUser = async (admin_id, password, done) => {

        const user = await getUserByColumn(admin_id, 'admin_id')
        
        if(user == null){
            return done(null, false, { message: '존재하지 않는 아이디입니다', cid : null }) // 작업끝날때마다 done()함수, 첫번째인자: 서버에 err있나, 두번째인자: 반환값, 세번째인자: 메시지
        }

        try {
            if( await encrypt.isHashMatched(password, user.admin_pw)){
                return done(null, user, { cid : user.cid })
            } else{
                return done(null, false, { message : '비밀번호가 틀립니다', cid : user.cid })
            }
        } catch (e) {
            return done(e)
        }

    }

    passport.use(new LocalStrategy({ usernameField : 'admin_id'}, authenticateUser))
    passport.serializeUser((user, done) => done(null,user.cid))     // Save user info in Session
    passport.deserializeUser((cid, done) => {
        getUserByColumn(cid, 'cid').then( user => {     // 여기 user를 매번 req에 담게 됨
            return done(null, user);
        })
    })
}


function getUserByColumn(inputValue, columnName){
    // User 정보 불러온 뒤 실행위해 Promise 객체 반환
    return new Promise( (resolve, reject) => {
        sql.generalQuery(
            `SELECT admin_id, admin_pw, cid, cname, authority, category1, campus FROM ${process.env.PROCESSING_DB} WHERE ${columnName}='${inputValue}'`,
            null,
            (err, results) => {
                if (err) {
                    console.log(err);
                    reject(null);
                } else {
                    resolve(results[0]);
                }
          })
    })
        
}

module.exports = initialize