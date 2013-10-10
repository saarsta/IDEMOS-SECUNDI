
var jest = require('jest')
    ,models = require('../models')
    ,common = require('./common')
    ,async = require('async')
    ,sendActivationMail = require('../routes/account/activation').sendActivationMail
    ,facebook_register = require('../routes/account/facebook_login').facebook_register
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

//            if(req.body.fb){
//                facebook_register(req,function(err,is_new){
//                    if(err){
//                        callback({message:err});
//                    }else{
//                        models.User.update({_id:req.session.user._id}, {$addToSet:{cycles:{cycle_id:cycle_id, join_date:Date.now()}}}, function(err,count){
//                            if(err){
//                                callback({message:err});
//                            } else{
//                                models.Cycle.update({_id: cycle_id}, {$inc:{followers_count:1}},  function(err,count){
//                                    if(err){
//                                        callback({message:err});
//                                    }else
//                                    {
//                                        callback  (null,req.session.user);
//                                    }
//                                });
//                            }
//                        });
//                    }
//
//                });
//            } else{
                registerUser(req,fields,function(err,user){
                    if(err)       {
                        callback({message:err}, user);
                    }else
                    {
                        callback(err, user);
                    }
                });
 //           }

        }
});






/**
 * Registers user and callbacks with a user object
 * @param req
 * @param data
 * @param next
 * @param callback
 * function(err,user)
 */
var registerUser =module.exports.registerUser  = function(req,data,callback) {
    var user = new models.User();
    var cycle_id = req.body.cycle;
    user.email = (data.email || '').toLowerCase().trim();
    if ('full_name' in data) {
        var name_parts = data['full_name'].trim().split(' ');
        user.first_name = name_parts.shift();
        user.last_name = name_parts.join(' ');
    } else {
        user.first_name = data.first_name;
        user.last_name = data.last_name;
    }
    user.identity_provider = "register";
    if (req.session.referred_by) {
        user.invited_by = req.session.referred_by;
    }

    /***
     * Waterfall:
     * 1) get user by email
     * 2) save user
     * 3) send activation mail
     * 4) authenticate to log user in
     * Final) Render response
     */
    async.waterfall([
        // 1) get user by email
        function(cbk) {
            models.User.findOne({email:new RegExp(user.email,'i')},cbk);
        },

        // 2) save user
        function(user_obj,cbk) {
            if (!user_obj) {
                user.save(function(err) {
                    req.session.user = user;
                    cbk(err);
                });
            } else {
                req.session.user = user_obj;
                if(cycle_id){
                    cbk(null)
                }else{
                    cbk('already_exists');
                }
            }
        },

        // 3) send activation mail
        function(cbk) {
             if(cycle_id){
                 models.User.update({_id:req.session.user._id}, {$addToSet:{cycles:{cycle_id:cycle_id, join_date:Date.now()}}}, function(err,count){
                    if(err){
                        cbk(err,count);
                    } else{
                        models.Cycle.update({_id: cycle_id}, {$inc:{followers_count:1}},  function(err,count){
                            if(err){
                                cbk(err,count);
                            }else
                            {
                                sendActivationMail(user, '/cycles/'+cycle_id,'activation_smallgov',cbk);
                            }
                        });
                    }
                 });
             } else  {
                 sendActivationMail(user, '',null,cbk);
             }

        },
        // 4) authenticate to log user in
        function(temp_password,cbk) {
            req.body['email'] = user.email;
            req.body['password'] = temp_password;
            req.authenticate('simple',function(err,is_authenticated) {
                cbk(err,is_authenticated);
            });
        }
    ],
        // Final) Render response
        function(err) {
            callback(err,user);
        });
};
