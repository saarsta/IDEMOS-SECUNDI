var models = require('../../models'),
    common = require('./common'),
    templates = require('../../lib/templates'),
    mail = require('../../lib/mail'),
    async = require('async')
    ,crypto = require('crypto');

module.exports = {
    get:function(req, res) {

        var user_id = req.query.id;
        var code = req.query.code;
        var email = req.user && req.user.email;

        async.waterfall([
            function(cbk) {
                if(!user_id || !code)
                    cbk('link');
                else
                    cbk();
            },
            function(cbk) {
                models.User.findById(user_id,cbk);
            },

            function(user,cbk) {
                if(!user) {
                    cbk('no user');
                    return;
                }

                if(user.validation_code == code) {
                    user.is_activated = true;
                  //  user.validation_code = '';
                    user.save(cbk);
                }
                else
                    cbk('wrong code');
            }
        ],function(err) {
            if(err)
                res.render('activation.ejs',{
                    next: req.query.next,
                    title: "רישום",
                    error:err || '',
                    sent: err == 'link',
                    email:email || ''
                });
            else {
                var redirect_to = next || common.DEFAULT_LOGIN_REDIRECT;
                redirect_to = redirect_to.indexOf('?') > -1 ? redirect_to + '&is_new=activated' : redirect_to + '?is_new=activated';
                res.redirect(redirect_to);
            }
        });

    },
    post: function(req,res) {
        var next = req.body.next || req.query.next;
        var email = (req.body.email  || req.query.email || (req.user && req.user.email) || '').toLowerCase().trim();

        var sendMail = function(user) {
            sendActivationMail(user,next,null,function(err) {
                if(err) {
                    console.error('can\'t send activation mail',err);
                    console.trace();
                    res.render('500.ejs',{error:err});
                }
                else {
                    res.render('activation.ejs',{
                        next: req.query.next,
                        title: "רישום",
                        error:'',
                        email:email,
                        sent:true
                    });
                }
            });
        };

        models.User.findOne({email:email},function(err,user) {
            if(!err && user) {
                sendMail(user);
            }
            else
                res.render('activation.ejs',{
                    next: req.query.next,
                    title: "רישום",
                    error:'unknown',
                    email:email,
                    sent:true
                });
        });



    }
};


var sendActivationMail = module.exports.sendActivationMail = function(user,next,mail_template,callback)
{

    var temp_password;
    var template =mail_template || 'activation';
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

            if(!user.validation_code )
                user.validation_code = validation;
            cbk();
        },
        function(cbk) {
            crypto.randomBytes(3,cbk);
        },
        function(buf,cbk) {
            temp_password = buf.toString('hex').toUpperCase();
            user.password =  common.hash_password( temp_password);
            user.save(function(err,user) {
                cbk(err,user);
            });
        },
        function(user,cbk) {
            templates.renderTemplate(template,{user:user, temp_password:temp_password,next:next},cbk);
        },
        function(body,cbk) {
            mail.sendMail(user.email, body, 'אימות חשבון באתר', cbk);
        }
    ],function(err) {
        callback(err,temp_password);
    });
};
