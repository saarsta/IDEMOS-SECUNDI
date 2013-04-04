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
            last_name: null,
            is_new:null,
            actions_done_by_user:{
                create_object:null,
                post_on_object:null,
                suggestion_on_object:null,
                grade_object:null,
                vote_on_object:null,
                join_to_object:null
            },
            tokens:null
        }
    },

    create_obj: function(req, fields, callback){
        req.authenticate('fb_server', function(err, is_authenticated){
            if(err) throw err;
            if (!is_authenticated) {
                callback({message: "error: not authenticated"});
                return;
            }
            var user = req.user;
            if (!user) {
                models.User.findById(req.session.user_id, function (err, db_user) {
                    db_user.is_new = req.session.is_new_user || false;
                    callback(err, db_user);
                })
            } else {
                user.is_new = req.session.is_new_user || false;
                callback(null, user);
            }
        })
    }
});


