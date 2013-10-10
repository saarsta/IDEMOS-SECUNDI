var models = require('../../models'),
    common = require('./common'),
    templates = require('../../lib/templates'),
    mail = require('../../lib/mail'),
    async = require('async');

module.exports ={
    get: function(req, res){
        res.render('forgot_password.ejs',{
            next: req.query.next,
            email:'',
            found:false,
            method:'get',
            title: "רישום"
        });
    },

    post: function(req, res){
        var email = req.body.email;

        //find user mail
        async.waterfall([
            function(cbk){
                models.User.findOne({email: email}, cbk);
            },

            function(user, cbk){
                if(user)
                  forgotPassword(user, cbk);
                else
                    cbk(null,0);
            }
        ], function(err, obj){

            if(err) {
                console.error('error sending forgot password mail to ' + email,err);
                console.trace();
                res.render('500.ejs',{error:err});
            }
            else
                if(obj == 0)
                    res.render('forgot_password.ejs',{
                        next: req.query.next,
                        found:false,
                        email:email,
                        method:'post',
                        title: "רישום"
                    });
                else
                    res.render('forgot_password.ejs',{
                        next: req.query.next,
                        email:email,
                        method:'post',
                        found:true,
                        title: "רישום"
                    });
        });
    }
}

var crypto = require('crypto');

//var sendgrid;
//var system_email;
//var root_path;
//
//module.exports.init = function(app)
//{
//    sendgrid = new SendGrid(app.settings.sendgrid_user, app.settings.sendgrid_key);
//    system_email = app.settings.system_email;
//    root_path = app.settings.root_path;
//};


var forgotPassword = function(user,callback)
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
            templates.renderTemplate('forgot',{user:user},cbk);
        },
        function(body,cbk) {
            mail.sendMail(user.email,body,'יצירת סיסמא חדשה לאתר עוּרו',cbk);
        }
    ],function(err, obj){
        callback(err, obj);
    });
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
