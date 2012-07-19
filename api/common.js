/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 15/02/12
 * Time: 17:21
 * To change this template use File | Settings | File Templates.
 */
var util = require('util');
// Authentication

var jest = require('jest'),
    cron = require('../cron').cron,
    models = require('../models'),
    async = require('async');

var ACTION_PRICE = 2;

var user_public_fields = exports.user_public_fields = {
    id:null,
    first_name:null,
    last_name:null,
    avatar_url:null,
    score: null,
    num_of_given_mandates: null,
    num_of_proxies_i_represent: null
};

var SessionAuthentication = exports.SessionAuthentication = function () { };
util.inherits(SessionAuthentication,jest.Authentication);

SessionAuthentication.prototype.is_authenticated = function(req, callback){

    var is_auth = req.isAuthenticated();
    if(is_auth)
    {
        var user_id = req.session.user_id;
        if(!user_id){
            callback({message: "no user id"}, null);
        }else{
            models.User.findById(user_id, function(err,user)
            {
                if(err)
                {
                    callback(err);
                }
                else
                {
                    req.user = user;
                    callback(null, true);
                }
            });
        }
    }
    else
    {
        if(req.method != 'GET')
            callback(null,false);
        else
            callback(null,true);
    }

};

var TokenAuthorization = exports.TokenAuthorization = jest.Authorization.extend({
    init:function(token_price)
    {
        this.token_price = token_price;
    },

    edit_object : function(req,object,callback){

        if (this.token_price || req.token_price)
        {
            if(req.user.tokens >= (this.token_price || req.token_price)){
                 callback(null, object);
            }else{
                callback({message:"Error: Unauthorized - there is not enought tokens",code:401}, null);
            }
        }
        else
            callback(null,object);
    }
});


var isArgIsInList = exports.isArgIsInList = function(arg_id, collection_list){
    var flag = false;
    for (var i = 0; i < collection_list.length; i++){
        arg_id = arg_id || arg_id.id;
        if (arg_id == collection_list[i].id){
            flag = true;
            break;
        }
    }
    return flag;
};


var score = {};
score.grade = 1;
score.vote = 1;
//score.post = 20;
//score.suggestion = 20;
//score.discussion = 30;

//
//function approve_item (item,item_type,user,callback)
//{
//    update_user_gamification(null,'approved_' + item_type,user,0,callback);
//}

function update_user_gamification(req, game_type, user, price, callback)
{
    var inc_user_gamification ={};
    var inc_user_gamification_score ={};
    inc_user_gamification['gamification.'+game_type] = 1;
    inc_user_gamification['score'] = score[game_type] || 0;

    if(price)
        inc_user_gamification['tokens'] = -price;

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
//                async.parallel([
//                    function(cbk){
//                        set_passive_user_updates(req, cbk);
//                    },
//
//                    function(cbk){
//                        check_gamification_rewards(user, cbk);
//
//                    }
//                ], function(err, args){
//                    console.log('user gamification saved');
//                    callback(err, args[1]);
//                })

//                check_gamification_rewards(user, callback);
                callback(err, 0);//TODO change it
                console.log('user gamification saved');

            }
        });
}

/*

//    בזבוז של כל הטוקנים במשך X ימים
function check_user_runout_of_tokens_time(user, callback){

    var X_DAYS_TIME = 1000*60*60*24* 3;
    var date = new Date();
    if(user.tokens == 0 && (date.getTime() - user.runout_of_tokens_time > ) ){
        cron.addTokensToUserByEventAndSetGamificationBonus(user._id, "", event_bonus, callback)
    }
}
*/
function set_passive_user_updates(req, callback){

//    req.update_type = req.update_type || {};
    if(req.update_type){

    }else{
        callback(null, 0);
    }
}

function check_gamification_rewards(user,callback)
{
    //if rewards reurn it
    //+ if perminant reward (king or something) insert to data base the new status

    callback(null,/*reward*/null);
}

function gamification_deserilize(self,base,req,res,obj,status)
{
    if(status == 201 || status == 202 && self.gamification_type || req.gamification_type)
    {
        update_user_gamification(req, self.gamification_type || req.gamification_type, req.user, self.token_price || req.token_price,function(err,rewards)
        {
            if(rewards)
                obj['rewards'] = rewards;

            if (obj)
                obj.updated_user_tokens = req.user.tokens;
            else
            {
                var temp_obj = {}
                    temp_obj.updated_user_tokens = req.user.tokens;
            }
            req.session.user = req.user;
            base(req,res,obj || temp_obj,status);
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
    deserialize:function(req, res, obj, status)
    {
        gamification_deserilize(this, this._super, req, res, obj, status);
    }
});

var token_prices = {};
function load_token_prices(){
    models.GamificationTokens.findOne({},function(err,doc)
    {
        if(doc)
            token_prices = doc._doc;
        if(err)
            console.error(err);
    });
};

load_token_prices();

models.GamificationTokens.schema.pre('save',function(next)
{
    setTimeout(load_token_prices, 1000);
    next();
});

exports.getGamificationTokenPrice = function(type)
{
    return token_prices[type] || 0;
};

var threshold_calc_variables = {};
function load_threshold_calc_variables(){
    models.ThresholdCalcVariables.findOne({},function(err,doc)
    {
        if(doc)
            threshold_calc_variables = doc._doc;
        if(err)
            console.error(err);
    });
};

load_threshold_calc_variables();

models.ThresholdCalcVariables.schema.pre('save',function(next)
{
    setTimeout(load_threshold_calc_variables, 1000);
    next();
});

exports.getThresholdCalcVariables = function(type)
{
    return threshold_calc_variables[type] || 0;
};