
var jest = require('jest')
    ,models = require('../models')
    ,common = require('./common')
    ,async = require('async')
    ,_ = require('underscore');

var FbConnectResource = module.exports =  jest.Resource.extend({

        init:function () {
            this._super();
            this.allowed_methods = ['post'];
            this.update_fields = {
                access_token: null,
                fb_id: null
            };
            this.fields = {
                user_id: null,
                first_name: null,
                last_name: null
            }
        },

        create_obj: function(req, fields, callback){

            req.authenticate('fb_server', function(err, is_authenticated){
                if(err)
                    callback(err)
                else{
                    if(is_authenticated){
                        var a = req;
                    }else{
                        callback({message: "error: not authenticated"});
                    }
                }
            })
        }
    }
)


