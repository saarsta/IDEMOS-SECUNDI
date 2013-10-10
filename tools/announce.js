
var mongoose = require('mongoose');

mongoose.connect('mongodb://heroku_app2952775:nuulb7icv8aafrr7n592uie793@ds031107.mongolab.com:31107/heroku_app2952775');

var
    app = require('../app'),
    models = require('../models'),
    common = require('./account/common'),
    templates = require('../lib/templates'),
    mail = require('../lib/mail'),
    crypto = require('crypto'),
    async = require('async');



app.set('root_path','http://www.uru.org.il');


var announceToUser = function(user,callback)
{
    var temp_password;

    /**
     * Waterfall:
     * 1) render forgot password template
     * 2) send mail
     */
    async.waterfall([
        function(cbk) {
            crypto.randomBytes(6, cbk);
        },
        function(buf,cbk) {

            var validation = buf.toString('hex');

            if(!user.validation_code )
                user.validation_code = validation;
            console.log(user.validation_code);
            cbk();
        },
        function(cbk) {
            crypto.randomBytes(3,cbk);
        },
        function(buf,cbk) {
            temp_password = buf.toString('hex').toUpperCase();
            user.password =  common.hash_password( temp_password)
            user.save(function(err,user) {
                cbk(err,user);
            });
        },
        function(user,cbk) {
            templates.renderTemplate('announce',{user:user, temp_password:temp_password},cbk);
        },
        function(body,cbk) {
            mail.sendMail(user.email,body,'אתר עוּרו עולה לאוויר! ברוכים הבאים.',cbk);
        }
    ],callback);
};


var fs = require('fs');

var filename = process.argv[2] || __dirname + '/users.csv';

// function for reading lines
function readLines(path, linefunc, endfunc) {
    var remaining = '';
    var input = fs.createReadStream(path);

    input.on('data', function(data) {
        remaining += data;
        var index = remaining.indexOf('\n');
        while (index > -1) {
            var line = remaining.substring(0, index);
            remaining = remaining.substring(index + 1);
            linefunc(line);
            index = remaining.indexOf('\n');
        }
    });

    input.on('end', function() {
        if (remaining.length > 0) {
            linefunc(remaining);
        }
        endfunc();
    });
}

var callbacks = 1;

function onScriptFinished(err)
{
    if(err)
    {
        console.log('failed ');
        console.log(err);
        process.exit(1);

    }
    else
    if(--callbacks === 0)
    {
        // process.exit(0);
    }
}
var counter = 0;

readLines(filename,function(line)
{
    var cells = line.split(',');
    var first_name = cells[0].trim();
    var last_name = cells[1].trim();
    var email = cells[2].trim();
    var user_code = cells[3].trim();
    var referral_code = cells[4].trim();
    if(referral_code == 'undefined')
        referral_code = '';
    if(referral_code == 'null')
        referral_code = '';

    if(!email || !/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/.test(email))
        return;
    callbacks++;

    console.log('checking user ' + email);

    function onFinish(err)
    {
        console.log('writing user ' + ++counter);
        onScriptFinished(err);
    }

    function userSave(user,isNew) {
        console.log('user created ' + email + ' with code ' + user.minisite_code);

        user.save(function(err) {
            if(err)
                console.error(err);
            if(isNew)
                afterCreate(user);
            else
                onFinish();
        });
    }
    function afterCreate(user) {
        announceToUser(user,function(err){
            if(err)
                console.error(err);
            onFinish();
        });
    }

    models.User.findOne({email:email},function(err,user)
    {
        if(err)
            onFinish(err);
        else
        {
            if(user)
            {
                console.log('user exists ' + email);
                if((!user.minisite_code && user_code) || (!user.invited_by && referral_code)) {
                    user.minisite_code = user_code;
                    if(!user.invited_by && referral_code)
                        models.User.findOne({minisite_code:referral_code},function(err,referrer) {
                            if(err)
                                onFinish(err);
                            else {
                                if(!referrer) {
                                    console.log('referrer doesn\'t exists: ' + referral_code);
                                    onFinish();
                                }else
                                {
                                    user.invited_by = referrer._id;
                                    userSave(user);
                                }
                            }
                        })
                    else
                        userSave(user);
                }
                else
                    onFinish();
            }
            else
            {
                user = new models.User();
                user.email = email;
                user.first_name = first_name;
                user.last_name = last_name;
                user.minisite_code = user_code;
                if(referral_code) {
                    models.User.findOne({minisite_code:referral_code},function(err,referrer) {
                        if(err)
                            onFinish(err);
                        else {
                            if(!referrer) {
                                console.log('referrer doesn\'t exists: ' + referral_code);
                                onFinish();
                            }else
                            {
                                user.invited_by = referrer._id;
                                userSave(user,true);
                            }
                        }
                    })
                }
                else {
                   userSave(user,true);
                }

            }
        }
    })

},function(){
    onScriptFinished();
});