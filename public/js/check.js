

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
      
      checkMasterAuth : function(req, res, next) {
        // 마스터 계정이 아니면 index 페이지로
        if (req.user.authority > 3) {
          // login success
          return next();
        }
        res.redirect("/");
      }
}