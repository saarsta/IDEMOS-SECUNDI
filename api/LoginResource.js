
var jest = require('jest')
    ,models = require('../models')
    ,common = require('./common')
    ,async = require('async')
    ,_ = require('underscore');

var LoginResource = module.exports =  jest.Resource.extend({

        init:function () {
            this._super();
            this.allowed_methods = ['post'];
            this.update_fields = {
                email:null,
                password:null
            };

            this.fields = {
                _id:null,
                first_name:null,
                last_name:null
            };
        },

        create_obj: function(req,fields,callback) {
            req.body['email'] = fields.email;
            req.body['password'] = fields.password;
            req.authenticate('simple',function(err,is_authenticated) {
                if(err){
                    if(err === "אימייל לא קיים"){
                        callback({message: err, code:401})
                    }else{
                        callback(err);
                    }
                }
                else {
                    if(!is_authenticated)
                        callback({message:"",code:401}, null);
                    else {
                        var user = req.session.user;
                        callback(null, user);
                    }
                }
            });
        }
    }
)
