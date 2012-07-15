var models = require('../../../models')
    , common = require('./common');

module.exports ={


    get: function(req, res){
        res.redirect(common.DEFAULT_LOGIN_REDIRECT)
        return;
//        res.render('code_after_fb_connect.ejs',{
//            url: req.url,
//            tag_name: req.query.tag_name,
//            layout: false,
//            user_logged: req.isAuthenticated(),
//            user: req.session.user,
//            next: req.query.next,
//            title: "רישום",
//            big_impressive_title: ""
//        });
    },

    post: function(req, res){
        res.redirect(common.DEFAULT_LOGIN_REDIRECT);
//        var invitation_code = req.body.invitation_code;
//
//        var user_id = req.session.user ? req.session.user._id : req.session.user_id;
//        models.User.update({_id: user_id}, {invitation_code: invitation_code}, function(err, num){
//            if(!err)
//                res.redirect(common.DEFAULT_LOGIN_REDIRECT);
//            else{
//                res.render('code_after_fb_connect.ejs',{
//                    url: req.url,
//                    tag_name: req.query.tag_name,
//                    layout: false,
//                    user_logged: req.isAuthenticated(),
//                    user: req.session.user,
//                    next: req.query.next,
//                    title: "רישום",
//                    big_impressive_title: "",
//                    error_message: err
//                });
//            }
//        })
    }
}

