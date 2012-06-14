
var common = require('./common');

module.exports =  function (req, res) {
    if (req.method == 'GET') {
        res.redirect('/account/facebooklogin');
        return;
//            res.render('login.ejs', {title:'Login',
//                tab:'user',
//                failed:false, exist_username:false, next:req.query.next});
    }
    else {
        req.authenticate('simple', function (err, is_authenticated) {
            if (is_authenticated) {
                var next = req.query.next || common.DEFAULT_LOGIN_REDIRECT;
                res.redirect(next);
            }
            else {
                res.render('login.ejs', {title:'Login',
                    tab:'users',
                    failed:true, exist_username:false, next:req.query.next});
            }
        });
    }
};