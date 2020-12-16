

module.exports = {
    checkAuthenticated : function(req, res, next) {
        // 로그인 안되어있으면 로그인페이지로
        if (req.isAuthenticated()) {
          // login success
          return next();
        }
        req.flash("error", '로그인 해주세요');
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
        try{
          if(req.user.authority === 0 || req.user.authority === 1){
            return res.redirect("/")
          }
          next();
        } catch(e) {
          return res.redirect("/")
        }
      },
      
      checkMasterAuth : function(req, res, next) {
        // 마스터 계정이 아니면 index 페이지로
        try{
          if (req.user && req.user.authority > 3) {
            // login success
            return next();
          }
          res.redirect('/');
        } catch (e) {
          res.redirect('/');
        }
      }
}