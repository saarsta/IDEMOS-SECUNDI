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

var ACTION_PRICE = 2;

var SessionAuthentication = exports.SessionAuthentication = function () { };
util.inherits(SessionAuthentication,jest.Authentication);

SessionAuthentication.prototype.is_authenticated = function(req,callback){
    var is_auth = req.isAuthenticated();
    callback(null, is_auth);
};

var TokenAuthorization = exports.TokenAuthorization = jest.Authorization.extend( {

    edit_object : function(req,object,callback){

        if(req.session.user_id){
            var user_id = req.session.user_id;
            models.User.findOne({_id :user_id},function(err,user)
            {
                if(err)
                {
                    callback(err, null);
                }
                else
                {
                    if (user.tokens >= DISCUSSION_PRICE){
                        callback(null, object);
                    }else{
                        callback({message:"Error: Unauthorized - there is not enought tokens",code:401}, null);
                    }
                }
            });
        }
        else{
            callback({message:"Error: User Is Not Autthenticated",code:401}, null);
        }
    }
});

/*TokenAuthorization.prototype.edit_object = function(req,object,callback){
    if(req.session.user_id){
        var user_id = req.session.user_id;
        models.User.findOne({_id :user_id},function(err,object)
        {
            if(err)
            {
                callback(err, null);
            }
            else
            {
                if (object.tokens >= ACTION_PRICE){
                    callback(null, object);
                }else{
                    callback({message:"Error: Unauthorized - there is not enought tokens",code:401}, null);
                }
            }
        });
    }
    else{
        callback({message:"Error: User Is Not Autthenticated",code:401}, null);
    }
};*/

/*
var isUserIsInCollection = exports.isUserIsInCollection = function(user_id, users_list){
    var flag = false;
    for (var i = 0; i < users_list.length; i++){
        if (user_id == users_list[i]){
            flag = true;
            break;
        }
    }
    return flag;
}
*/

var isArgIsInList = exports.isArgIsInList = function(arg_id, collection_list){
    var flag = false;
    for (var i = 0; i < collection_list.length; i++){
        if (arg_id == collection_list[i]){
            flag = true;
            break;
        }
    }
    return flag;
};


var score = {};
score.grade = 10;
score.vote = 10;
score.post = 20;
score.suggestion = 20;
score.discussion = 30;

function update_user_gamification(req, game_type, user_id,callback)
{
    var inc_user_gamification ={};
    var inc_user_gamification_score ={};
    inc_user_gamification['gamification.'+game_type] = 1;
    inc_user_gamification['score'] = score[game_type];

    models.User.findById(user_id,function(err,user)
    {
        user.gamification = user.gamification || {};
        user.gamification[game_type] = user.gamification[game_type] || 0;
        user.gamification[game_type] += 1;
        user.score += score[game_type];
        models.User.update({_id:user_id},{$inc:inc_user_gamification},function(err,num)
        {
            if(err)
                callback(err);
            else
            {
                check_gamification_rewards(user,callback);
                console.log('user gamification saved');
            }
        });
    });
}

//    models.User.collection.findAndModify({_id:user_id},[],{},{},function(err,user)
//    {
//        check_gamification_rewards(user,callback);
//    });

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
    deserialize:function(req, res,obj,status)
    {
        var self = this;
        if((status == 201 || status == 204) && (self.gamification_type || req.gamification_type))
        {
            update_user_gamification(req, self.gamification_type || req.gamification_type, req.session.user_id,function(err,rewards)
            {
                if(rewards)
                    obj['rewards'] = rewards;
                self._super.deserialize(req,res,obj,status);
            });
        }
        else{
            self._super.deserialize(req,res,obj,status);
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
        if(status == 201 || status == 204 && self.gamification_type || req.gamification_type)
        {

            update_user_gamification(req, self.gamification_type || req.gamification_type, req.session.user_id,function(err,rewards)
            {
                if(rewards)
                    obj['rewards'] = rewards;
                base(req,res,obj,status);
            });
        }else{
            base(req,res,obj,status);
        }
    }
});