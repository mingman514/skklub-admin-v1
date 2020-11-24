

module.exports = {
    checkAuthenticated : function(req, res, next) {
        // 로그인 안되어있으면 로그인페이지로
        if (req.isAuthenticated()) {
          // login success
          return next();
        }
        res.redirect("/login");
      },
      
      checkNotAuthenticated : function(req, res, next) {
        // 로그인 되어있으면 홈으로
        if (req.isAuthenticated()) {
          return res.redirect("/");
        }
        next();
      },

      checkEditable : function(req, res, next){
        // 권한이 0, 1인 경우 이전 페이지로
        if(req.user.authority === 0 || req.user.authority === 1){
          return res.redirect("/")
        }
        next();
      },
      
      checkMasterAuth : function(req, res, next) {
        // 마스터 계정이 아니면 index 페이지로
        if (req.user && req.user.authority > 3) {
          // login success
          return next();
        }
        req.flash("flash", '인증정보가 만료되었습니다. 다시 로그인 해주세요.');
        res.render('login.ejs');
      }
}