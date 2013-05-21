var jest = require('jest')
    ,common = require('./common')
    ,models = require('../models')
    ,og_action = require('../og/og').doAction
    ,_ = require('underscore')
    ,mail = require('../lib/mail');



var SendMailResource = module.exports = jest.Resource.extend({
    init:function() {
        this._super();
        this.allowed_methods = ['post'];
        this.authentication = new common.SessionAuthentication();
        this.fields = {};
        this.update_fields = {
            body : null
        };
    },

    create_obj: function(req,fields,callback) {
        var user = req.user;
        var to = 'info@uru.org.il';
        var subject = 'NO MORE MAILS FOR ' + user.email;
        var explanation = 'The reason is:' + '<br>' + fields.body;
        mail.sendMail(to, explanation, subject, function(err){
            callback(err);
        });
    }
});

