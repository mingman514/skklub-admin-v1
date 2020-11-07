const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByAdminId, getUserByCid){
    const authenticateUser = async (admin_id, password, done) => {
        const user = getUserByAdminId(admin_id)
        if(user == null){
            return done(null, false, { message: '존재하지 않는 아이디입니다.'}) // 작업끝날때마다 done()함수, 첫번째인자: 서버에 err있나, 두번째인자: 반환값, 세번째인자: 메시지
        }
        
        try {
            if(await bcrypt.compare(password, user.admin_pw)){
                return done(null, user)
            } else{
                return done(null, false, { message : '비밀번호가 틀립니다.' })
            }
        } catch (e) {
            return done(e)
        }

    }

    passport.use(new LocalStrategy({ usernameField : 'admin_id'}, authenticateUser))
    passport.serializeUser((user, done) => done(null,user.cid))
    passport.deserializeUser((cid, done) => {
        return done(null, getUserByCid(cid))
    })

}

module.exports = initialize