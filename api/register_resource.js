
var jest = require('jest')
    ,models = require('../models')
    ,common = require('./common')
    ,async = require('async')
    ,registerUser = require('../deliver/routes/account/register').registerUser
    ,_ = require('underscore');

var RegisterResource = module.exports =  jest.Resource.extend({

        init:function () {
            this._super();
            this.allowed_methods = ['post'];
            this.update_fields = {
                email:null,
                full_name:null
            };

            this.fields = {
                _id:null,
                first_name:null,
                last_name:null
            };
        },

        create_obj: function(req,fields,callback) {
            var user = new models.User();
            registerUser(req,fields,'',callback);
        }
});
