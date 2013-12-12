
var mongoose = require('mongoose');

mongoose.connect('mongodb://heroku_app2952775:nuulb7icv8aafrr7n592uie793@ds031107.mongolab.com:31107/heroku_app2952775');

var
    app = require('../app'),
    models = require('../models'),
    common = require('./account/common'),
    templates = require('../lib/templates'),
    mail = require('../lib/mail'),
    crypto = require('crypto'),
    _ = require('underscore'),
    async = require('async');

var IS_TEST = false;

var ONLY_MAIL_TO = ['saar@empeeric.com','saarsta@gmail.com','konfortydor@gmail.com','hadar@empeeric.com'];

var LAG = 5;
var LAG_SIZE = 400;


app.set('root_path','http://www.uru.org.il');

require('../lib/mail').load(app);

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
            templates.renderTemplate('field_joiners',{user:user, temp_password:temp_password},cbk);
        },
        function(body,cbk) {
            mail.sendMail(user.email,body,'אימות חשבון באתר',cbk);
        }
    ],callback);
};


var fs = require('fs');

var filename = process.argv[2] || __dirname + (IS_TEST ? '/users.csv' : '/users_orig.csv');

// function for reading lines
function readLines(path, linefunc, endfunc) {
    var remaining = '';
    var input = fs.createReadStream(path);
    var i=0;

    input.on('data', function(data) {
        remaining += data;
        var index = remaining.indexOf('\n');
        while (index > -1) {
            var line = remaining.substring(0, index);
            remaining = remaining.substring(index + 1);
            linefunc(line,i++);
            index = remaining.indexOf('\n');
        }
    });

    input.on('end', function() {
        if (remaining.length > 0) {
            linefunc(remaining,i++);
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

readLines(filename,function(line,index)
{
    if(index-100 < LAG*LAG_SIZE || index-100 >= (LAG+1)*LAG_SIZE) {
        console.log('skipping' + index);
        return;
    }

    var cells = line.split(',');
    var email = (cells[0] || '').trim().toLowerCase();
    var first_name = (cells[1] || '').trim();
    var last_name = (cells[2] || '').trim();

    if(!first_name || first_name.length < 2 || !email || !/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/.test(email))
        return;
    if(IS_TEST && !_.include(ONLY_MAIL_TO,email))
        return;
    callbacks++;

    console.log('checking user ' + email);

    function onFinish(err)
    {
        console.log('finished user ' + ++counter);
        onScriptFinished(err);
    }

    function userSave(user,isNew) {
        console.log('user created ' + email);
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
            if(user && user.is_activated && !IS_TEST)
            {
                onFinish();
            }
            else
            {
                user = user || new models.User();
                user.email = email;
                user.first_name = first_name;
                user.last_name = last_name;
                userSave(user,true);
            }
        }
    })

},function(){
    onScriptFinished();
});