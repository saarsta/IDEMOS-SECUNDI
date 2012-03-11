/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 15/02/12
 * Time: 17:21
 * To change this template use File | Settings | File Templates.
 */
var util = require('util');
// Authentication

var jest = require('jest')
    ,models = require('../models');

var SessionAuthentication = exports.SessionAuthentication = function () { };
util.inherits(SessionAuthentication,jest.Authentication);

SessionAuthentication.prototype.is_authenticated = function(req,callback){
    var is_auth = req.isAuthenticated();
    callback(null, is_auth);
};



var isUserIsInDiscussion = exports.isUserIsInDiscussion = function(user_id, users_list){
    var flag = false;
    for (var i = 0; i < users_list.length; i++){
        if (user_id == users_list[i]){
            flag = true;
            break;
        }
    }
    return flag;
}

var isDiscussionIsInUser = exports.isDiscussionIsInUser = function(discussion_id, discussions_list){
    var flag = false;
    for (var i = 0; i < discussions_list.length; i++){
        if (discussion_id == discussions_list[i]){
            flag = true;
            break;
        }
    }
    return flag;
};

function update_user_gamification(game_type,user_id,callback)
{
    var increment ={};
    increment['gamification.'+game_type] = 1;
    models.User.findById(user_id,function(err,user)
    {
        user.gamification = user.gamification || {};
        user.gamification[game_type] = user.gamification[game_type] || 0;
        user.gamification[game_type] += 1;
        models.User.update({_id:user_id},{$inc:increment},function(err,num)
        {
            if(err)
                callback(err);
            else
            {
                check_gamification_rewards(user,callback);
            }
            console.log('user saved');
        });
    });
//    models.User.collection.findAndModify({_id:user_id},[],{},{},function(err,user)
//    {
//        check_gamification_rewards(user,callback);
//    });
}

function check_gamification_rewards(user,callback)
{
    //if rewards reurn it
    //+ if perminant reward (king or something) insert to data base the new status
    callback(null,/*reward*/null);
}

var GamificationResource = exports.GamificationResource  = jest.Resource.extend({
    init:function(type)
    {
        this.gamification_type = type;
        return this._super();
    },
    deserialize:function(req,res,obj,status)
    {
        var self = this;
        if(status == 201 || status == 204 && self.gamification_type)
        {
            update_user_gamification(self.gamification_type,req.session.user_id,function(err,rewards)
            {
                if(rewards)
                    obj['rewards'] = rewards;
                self._super.deserialize(req,res,obj,status);
            });
        }
    }
});

var GamificationMongooseResource = exports.GamificationMongooseResource = jest.MongooseResource.extend({
    init:function(model,type)
    {
        this.gamification_type = type;
        return this._super(model);
    },
    deserialize:function(req,res,obj,status)
    {
        var self = this;
        var base = this._super;
        if(status == 201 || status == 204 && self.gamification_type)
        {
            update_user_gamification(self.gamification_type,req.session.user_id,function(err,rewards)
            {
                if(rewards)
                    obj['rewards'] = rewards;
                base(req,res,obj,status);
            });
        }
    }
});