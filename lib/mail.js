

var SendGrid = require('sendgrid').SendGrid
    ,Email = require('sendgrid').Email;

var sendgrid, from;

exports.load = function(app)
{
    sendgrid = new SendGrid(app.settings.sendgrid_user, app.settings.sendgrid_key);
    from = app.settings.system_email;
};

exports.sendMail = function(to,body,subject,callback) {

    console.log('sending to ' + to + ' ' + subject);

    var email = new Email({
        to:[to],
        from:from,
        subject:subject,
        html:body
    });

    sendgrid.send(email,function(success,message) {
        if(!success)
            callback(message);
        else
            callback(null,message);
    });

};