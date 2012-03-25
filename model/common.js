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
    if(is_auth)
    {
        var user_id = req.session.user_id;
        models.User.findById(user_id,function(err,user)
        {
            if(err)
            {
                callback(err);
            }
            else
            {
                req.user = user;
                callback(null,true);
            }
        });
    }
    else
        callback(null,false);
};

var TokenAuthorization = exports.TokenAuthorization = jest.Authorization.extend( {
    init:function(token_price)
    {
        this.token_price = token_price;
    },

    edit_object : function(req,object,callback){

//        if(req.session.user_id){
//            var user_id = req.session.user_id;
//            models.User.findOne({_id :user_id},function(err,user)
//            {
//                if(err)
//                {
//                    callback(err, null);
//                }
//                else
//                {
            if (this.token_price || req.token_price)
            {
                if(req.user.tokens >= this.token_price || req.token_price){
                     callback(null, object);
                }else{
                    callback({message:"Error: Unauthorized - there is not enought tokens",code:401}, null);
                }
            }
            else
                callback(null,object);
//                }
//            });
//        }
//        else{
//            callback({message:"Error: User Is Not Autthenticated",code:401}, null);
//        }
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

function update_user_gamification(req, game_type, user, price, callback)
{
    var inc_user_gamification ={};
    var inc_user_gamification_score ={};
    inc_user_gamification['gamification.'+game_type] = 1;
    inc_user_gamification['score'] = score[game_type] || 0;
    if(price)
        inc_user_gamification['tokens'] = -price;

//    models.User.findById(user_id,function(err,user)
//    {
        user.gamification = user.gamification || {};
        user.gamification[game_type] = user.gamification[game_type] || 0;
        user.gamification[game_type] += 1;
        user.score += score[game_type];
        if(price)
            user.tokens -= price;
        models.User.update({_id:user.id},{$inc:inc_user_gamification},function(err,num)
        {
            if(err)
                callback(err);
            else
            {
                check_gamification_rewards(user,callback);
                console.log('user gamification saved');
            }
        });
//    });
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

function gamification_deserilize(self,base,req,res,obj,status)
{
    if(status == 201 || status == 204 && self.gamification_type || req.gamification_type)
    {

        update_user_gamification(req, self.gamification_type || req.gamification_type, req.user,self.token_price || req.token_price,function(err,rewards)
        {
            if(rewards)
                obj['rewards'] = rewards;
            base(req,res,obj,status);
        });
    }else{
        base(req,res,obj,status);
    }

}


var GamificationResource = exports.GamificationResource  = jest.Resource.extend({
    init:function(type,price)
    {
        this.gamification_type = type;
        this._super();
        this.authorization = new TokenAuthorization(price || 0);
        this.token_price = price;
    },
    deserialize:function(req, res,obj,status)
    {
        gamification_deserilize(this,this._super,req,res,obj,status);
    }
});



var GamificationMongooseResource = exports.GamificationMongooseResource = jest.MongooseResource.extend({
    init:function(model,type,price)
    {
        this.gamification_type = type;
        this._super(model);
        this.authorization = new TokenAuthorization(price || 0);
        this.token_price = price;
    },
    deserialize:function(req,res,obj,status)
    {
        gamification_deserilize(this,this._super,req,res,obj,status);
    }
});