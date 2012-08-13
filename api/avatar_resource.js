


var jest = require('jest')
    ,common = require('./common')
    ,fs = require('fs')
    ,util = require('util')
    ,path = require('path')
    ,models = require('../models');

var AvatarResource = module.exports = jest.Resource.extend({
    init:function() {
        this._super();

        this.allowed_methods = ['post'];

        this.authentication = new common.SessionAuthentication();

        this.authorization = new jest.Authorization();

//        this.fields = {
//            avatar:{
//                url:null
//            }
//        };

        this.update_fields = {
            image : null
        };
    },

    deserialize: function(req,res,object,status) {
        if(status == 201)
            status = 200;
        res.send(object,status);
    },

    create_obj: function(req,fields,callback) {
        var self = this;

        common.uploadHandler(req,function(err,value) {
            if(err)
                callback(err);
            else {
                req.user.avatar = value;
                req.user.save(function(err) {
                    callback(err,{avatar:value,status:'success'});
                });
            }
        });

    }
});
