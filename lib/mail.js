

var SendGrid = require('sendgrid').SendGrid
    ,Email = require('sendgrid').Email;

var sendgrid, from;

exports.load = function(app)
{
    sendgrid = new SendGrid(app.settings.sendgrid_user, app.settings.sendgrid_key);
    from = app.settings.system_email;
};

var sendMail = exports.sendMail = function(to,body,subject,callback) {


    if(!sendgrid) {
        console.log('email not sent because it\'s off in app.js. to turn mails on set app.set("send_mails",true); ');
        callback();
        return;
    }

    console.log('sending to ' + to + ' ' + subject);

    var email = new Email({
        to:[to],
        from:from,
        fromname:'אתר מחליטים: כבוד האדם',
        subject:subject,
        html:body
    });

    sendgrid.send(email,function(success,message) {
        if(!success){
            console.error('mail was not sent');
            callback(message);
        }
        else{
            console.log('mail was sent');
            callback(null,message);
        }
    });

};

var sendMailFromTemplate = exports.sendMailFromTemplate = function(to,string,callback) {
    var parts = string.split('<!--body -->');
    var subject = parts[0] || 'אתר מחליטים: כבוד האדם';
    var body = parts[1] || parts[0];
    sendMail(to,body,subject,callback);
};