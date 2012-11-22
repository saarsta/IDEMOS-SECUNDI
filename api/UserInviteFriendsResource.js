/**
 * Created by
 * User: liorur
 * Date: 22/10/12
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async'),
    _ = require('underscore');


var UserInviteFriendsResource = module.exports = common.GamificationMongooseResource.extend({
    init: function(){
        this._super(models.User, null, 0);
        this.allowed_methods = ['post'];
        this.authentication = new common.SessionAuthentication();
        //returned
        this.fields = {
            _id: null   ,
            invited_friends:null
        }
    },

    create_obj: function(req,fields,callback){

        models.User.findById(req.user._id, function(err,user){
            //look for exisiting entry with same object id- if exist the unify else:

            var new_invite_object  =  {
                object_type:fields.type,
                object_id:fields.id,
                facebook_request:fields.facebook ?fields.facebook.request:null  ,
                facebook_ids:fields.facebook ?fields.facebook.to : null  ,
                emails:fields.email  ,
                date: {type:Date, 'default':Date.now}
            }

             if(user.invited_friends){
                 var invite_object =  _.find(user.invited_friends, function(invite){
                     return  invite.object_id  == fields.id;
                 });
                 if(invite_object) {
                     user.invited_friends  =        user.invited_friends.filter(function (invite, index, array) {
                             return  invite.object_id  != fields.id;
                     });
                     new_invite_object.emails = _.union(new_invite_object.emails,new_invite_object.emails,invite_object.emails)
                 }
             }

             user.invited_friends.push( new_invite_object);

            user.save(function(err, obj){

                callback(err, obj);
            })

        });


    }
})