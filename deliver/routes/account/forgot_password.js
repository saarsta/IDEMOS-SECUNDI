var models = require('../../../models'),
    common = require('./common'),
    async = require('async');

module.exports ={
    get: function(req, res){
        res.render('forgot_password.ejs',{
            url: req.url,
            tag_name: req.query.tag_name,
            layout: false,
            user_logged: req.isAuthenticated(),
            user: req.session.user,
            next: req.query.next,
            title: "רישום",
            big_impressive_title: ""
        });
    },

    post: function(req, res){
        var email = req.body.email;

        //find user mail
        async.waterfall([
            function(cbk){
                console.log("1");
                models.User.findOne({email: email}, cbk);
            },

            function(user, cbk){
                console.log("2");
                console.log(user);
                if(user)
                  forgotPassword(user, cbk);
                else
                    cbk(null,0);
            }
        ], function(err, obj){

            if(err)
                res.send('something wrong', 500);
            else
                if(obj == 0)
                    res.send('no such email', 500);
                else
                    res.send('validation email was sent to your e-mail address', 200);
        })
    }
}

var SendGrid = require('sendgrid-nodejs').SendGrid
    ,crypto = require('crypto');

var sendgrid;
var system_email;
var root_path;

module.exports.init = function(app)
{
    sendgrid = new SendGrid(app.settings.sendgrid_user, app.settings.sendgrid_key);
    system_email = app.settings.system_email;
    root_path = app.settings.root_path;
};


var forgotPassword = function(user,callback)
{
    crypto.randomBytes(6, function(ex, buf) {
        var validation = buf.toString('hex');

        user.validation_code = validation;
        user.save(function(err,user)
        {
            if(err)
                callback(err);
            else
            {
                console.log("my email");
                console.log("user.email");
                var optionalParams = {
                    to: user.email,
                    from: system_email,
                    subject: 'Password Recover',
                    text: '',
                    html: '<a href="' + root_path + "/account/reset_password?validation=" + validation + "&id=" + user.id + '">' +
                        "לחץ כאן כדי להיכנס לאתר" +
                        '</a>',
                    bcc: [],
                    replyto: '',
                    date: new Date()
                };

                var Email = require('sendgrid').Email;
                var email = new Email(optionalParams);

                sendgrid.send(email, function(success, message) {
                    if (!success) {
                        callback(message);
                    }else
                        callback();
                });
            }
        });
    });
};
