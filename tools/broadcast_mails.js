
var mongoose = require('mongoose');

mongoose.connect('mongodb://heroku_app2952775:nuulb7icv8aafrr7n592uie793@ds031107.mongolab.com:31107/heroku_app2952775');

var app = require('../app'),
    models = require('../models'),
    common = require('../deliver/routes/account/common'),
    templates = require('../lib/templates'),
    mail = require('../lib/mail'),
    async = require('async');


setTimeout(function(){

app.set('root_path','http://www.uru.org.il');
app.set('send_mails',true);

templates.renderTemplate('elections',{},function(err,body) {

    var skipped = 0;
    var sent = 0;

    if(err) {
        console.error(err);
        return;
    }

    var stream = models.User.find({})
        .select({email:1, sent_mail:1})
        .limit(3000)
        .stream();

    stream.on('data',function(user) {
        if(user.sent_mail && user.sent_mail > new Date(Date.now() - 1000*60*60*5)){
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
