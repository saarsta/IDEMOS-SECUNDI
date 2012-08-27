
var mongoose = require('mongoose');

mongoose.connect('mongodb://heroku_app2952775:nuulb7icv8aafrr7n592uie793@ds031107.mongolab.com:31107/heroku_app2952775');

var app = require('../app'),
    models = require('../models'),
    common = require('../deliver/routes/account/common'),
    templates = require('../lib/templates'),
    mail = require('../lib/mail'),
    async = require('async');



var MAILTEMPLATE = 'elections2';

var IS_TEST = true;
var SEND_TO = ['ishai@empeeric.com'
    ,'saarsta@gmail.com'
    ,'konfortydor@gmail.com'
];

var LIMIT = 5000;

setTimeout(function(){

app.set('root_path','http://www.uru.org.il');

require('../lib/mail').load(app);

    templates.renderTemplate(MAILTEMPLATE,{},function(err,body) {

    var skipped = 0;
    var sent = 0;

    if(err) {
        console.error(err);
        return;
    }


    var query = IS_TEST ? {email:{$in:SEND_TO}} : {};
    var limit = IS_TEST ? 3 : LIMIT;

    var stream = models.User.find(query)
        .select({email:1, sent_mail:1})
        .limit(limit)
        .stream();

    stream.on('data',function(user) {
        console.log(user.email);
        if(!IS_TEST && user.sent_mail && user.sent_mail > new Date(Date.now() - 1000*60*60*5)){
            console.log('skipped');
            skipped++;
            return;
        }
        mail.sendMailFromTemplate(user.email,body,function(err) {
            if(err) {
                console.error('error sending mail to ' + user.email,err);
                console.trace();
            }
            sent++;
            user.sent_mail = new Date();
            user.save(function(err) {
                if(err) {
                    console.error('error saving user ' + user.email,err);
                }
            });
        });
    });

    stream.on('end',function(){
        console.log('finished');
        console.log('sent ' + sent);
        console.log('skipped ' + skipped);
    });

    stream.on('error',function(err) {
        console.error(err);
    });


    setInterval(function(){
        console.log('finished');
        console.log('sent ' + sent);
        console.log('skipped ' + skipped);
    },15000);
});

},1000);
