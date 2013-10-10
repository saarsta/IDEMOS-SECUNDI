
var mongoose = require('mongoose');

mongoose.connect('mongodb://heroku_app2952775:nuulb7icv8aafrr7n592uie793@ds031107.mongolab.com:31107/heroku_app2952775');

var app = require('../app'),
    models = require('../models'),
    common = require('./account/common'),
    templates = require('../lib/templates'),
    mail = require('../lib/mail'),
    async = require('async');



var MAILTEMPLATE = 'movie';

var IS_TEST = true;
var BLACK_LIST = ['arad.aki@gmail.com',
    'urian@013.net',
    'luci.fer.female@gmail.com',
    'tsela@yagur.com',
    'savtaesther@gmail.com',
    'beeri.korin@gmail.com',
    'srahav@gmail.com',
    'kate.volkova@gmail.com',
    'sanity@gmail.com',
    'yakov.brakha@gmail.com',
    'mayoliat@yahoo.com',
    'genisny@gmail.com',
    'yaffeis@gmail.com',
    'balisegev@gmail.com',
    'mr.avichay@gmail.com',
    'silviur@walla.com',
    'livnieli69@gmail.com',
    'orna.amos@gmail.com',
    'wmikel@walla.com',
    'atzivon@gmail.com'];

var SEND_TO = ['ishai@empeeric.com'
    ,'saarsta@gmail.com'
    ,'konfortydor@gmail.com'
];

var LIMIT = 8000;

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


    var query = IS_TEST ? {email:{$in:SEND_TO}} : {email:{$nin:BLACK_LIST}};
    var limit = IS_TEST ? 3 : LIMIT;

    var stream = models.User.find(query)
        .select({email:1, sent_mail:1})
        .limit(limit)
        .stream();

    stream.on('data',function(user) {
        if(_.any(BLACK_LIST,function(email) {
            return email.toLowerCase().trim() == (user.email || '').toLowerCase().trim();
        })) {
            console.log('found black list email');
            skipped++;
            return;
        }
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
