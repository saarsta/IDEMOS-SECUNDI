var models = require('../../../models'),
    common = require('./common'),
    templates = require('../../../lib/templates'),
    mail = require('../../../lib/mail'),
    async = require('async');

module.exports = function(req, res){

        res.render('validation_password.ejs',{
            url: req.url,
            tag_name: req.query.tag_name,
            layout: false,
            user_logged: req.isAuthenticated(),
            user: req.session.user,
            next: req.query.next,
            title: "רישום",
            big_impressive_title: ""
        });
};

var crypto = require('crypto');

var validation = function(user,callback)
{

    /**
     * Waterfall:
     * 1) create random validation code
     * 2) save validation code to user
     * 3) render forgot password template
     * 4) send mail
     */
    async.waterfall([
        function(cbk) {
            crypto.randomBytes(6, cbk);
        },
        function(buf,cbk) {
            var validation = buf.toString('hex');

            user.validation_code = validation;
            user.save(function(err,user) {
                cbk(err,user);
            });
        },
        function(user,cbk) {
            templates.renderTemplate('validation',{user:user},cbk);
        },
        function(body,cbk) {
            mail.sendMail(user.email,body,'אימות חשבון באתר עוּרו',cbk);
        }
    ],callback);
//    crypto.randomBytes(6, function(ex, buf) {
//        var validation = buf.toString('hex');
//
//        user.validation_code = validation;
//        user.save(function(err,user)
//        {
//            if(err)
//                callback(err);
//            else
//            {
//                console.log("my email");
//                console.log("user.email");
//
//                templates.renderTemplate('forgot',{user:user},function(err,))
//
//
//                var optionalParams = {
//                    to: user.email,
//                    from: system_email,
//                    subject: 'Password Recover',
//                    text: '',
//                    html: '<a href="' + root_path + "/account/reset_password?validation=" + validation + "&id=" + user.id + '">' +
//                        "לחץ כאן כדי להיכנס לאתר" +
//                        '</a>',
//                    bcc: [],
//                    replyto: '',
//                    date: new Date()
//                };
//
//                var Email = require('sendgrid').Email;
//                var email = new Email(optionalParams);
//
//                sendgrid.send(email, function(success, message) {
//                    if (!success) {
//                        callback(message);
//                    }else
//                        callback();
//                });
//            }
//        });
//    });
};
