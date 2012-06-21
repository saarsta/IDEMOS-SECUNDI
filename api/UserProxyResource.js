var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async'),
    _ = require('underscore');

var Authorization = resources.Authorization.extend({
    edit_object : function(req,object,callback){
        if(req.user){
            if (object._id + "" == req.user._id + "")
                if(req.body.number_of_tokens > object.tokens)
                    callback({message:"Error: Unauthorized - you don't have enougth tokens tp give!", code: 401}, null);
                else
                    callback();
            else
                callback({message:"Error: Unauthorized - can't set other people proxies!", code: 401}, null);
        }else{
            callback({message: "Error: User Is Not Authenticated", code: 401}, null);
        }
    },

    limit_object_list: function(req, query, callback){
        if(req.user){
            var user_id = req.user._id;

            query.where('_id', user_id);
            callback(null, query);
        }else{
            callback({message: "Error: User Is Not Authenticated", code: 401}, null);
        }
    }
});

var UserProxyResource = module.exports = common.GamificationMongooseResource.extend({
    init: function(){
        this._super(models.User, null, 0);
        this.allowed_methods = ['get', 'put', 'delete'];
        this.authentication = new common.SessionAuthentication();
        this.authorization = new Authorization();
        this.fields = {
            _id: null,
            first_name: null,
            last_name: null,
            num_of_given_mandates: null,
            proxy: {
                user_id:{
                    _id: null,
                    facebook_id: null,
                    avatar_url: null,
                    first_name: null,
                    last_name: null,
                    number_of_tokens: null
                }
            },
            tokens: null,
            daily_tokens: null
        }
//        this.default_query = function(query){
//            return query.populate("followers.follower_id");
//        };

    },

    run_query: function(req,query,callback)
    {
        if(req.method == 'GET'){
            query.populate("proxy.user_id");
        };
        this._super(req,query,callback);
    },

    get_object: function(req, id, callback){
      this._super(req, id, function(err, obj){
         obj.daily_tokens = 9 + obj.num_of_extra_tokens;
         callback(err, obj);
      })
    },

    update_obj: function (req, object, callback) {
        //proxy is a list of peopole for whom i gave my mandates, and it saved in my schema
        var proxy_id = req.body.proxy_id;
        var number_of_tokens = req.body.number_of_tokens;
        var proxy = _.find(object.proxy, function(proxy_user){return proxy_user.user_id + "" == proxy_id + ""});

        if(proxy){
            //edit proxy's mandates(tokens)
            if (req.body.number_of_tokens > 0){
                proxy.number_of_tokens += req.body.number_of_tokens;
                //reduce tokens from my tokens
                object.tokens -= req.body.number_of_tokens;



                //set notification here



            }else
                //tokens will be removed once a day by a cron
                proxy.number_of_tokens_to_get_back += req.body.number_of_tokens;
        }else{
            //edit proxy's mandates(tokens)
            proxy = {
                user_id: proxy_id,
                number_of_tokens: null,
                number_of_tokens_to_get_back: null
            };

            if (req.body.number_of_tokens > 0){
                proxy.number_of_tokens = req.body.number_of_tokens;
                //reduce tokens from my tokens
                object.tokens -= req.body.number_of_tokens;


                //set notification here


            }else
            //tokens will be removed once a day by a cron
                proxy.number_of_tokens_to_get_back = req.body.number_of_tokens;

            object.proxy.push(proxy);
        }

        //TODO ask ishai why the fuck it saves it on my user obj
        object.proxy_id = null;
        object.number_of_tokens = null;

        if(proxy.number_of_tokens > 3)
            callback({message:"Error: Unauthorized - max mandate is 3!", code: 401}, null)
        else{
            //save user object
            object.save(function(err, user_obj){
                if(!err && req.body.number_of_tokens > 0){
                    //update proxy-user new tokens
                    models.User.update({_id: proxy_id}, {$inc: {num_of_given_mandates: number_of_tokens}}, function(err, num){
                        callback(err, user_obj);
                    })
                }else{
                    callback(err, user_obj);
                }
            })
        }
    },

    delete_obj: function(req,object,callback){

        var flag = false;
        var num_of_tokens;
        //find specified proxy and delete it
        for(var i=0; i<object.proxy.length; i++)
        {
            if(object.proxy[i].user_id + "" == req.body.proxy_id)
            {
                flag = true;
                num_of_tokens = object.proxy[i].number_of_tokens;
                object.proxy.splice(i,1);
                break;
            }
        }
        object.save(function(err, user_obj){
            if(flag){
                models.User.update({_id: object._id}, {$inc: {toknes: num_of_tokens}}, function(err, num){
                    callback(err, user_obj);
                });
            }
            callback(err, "didn't find proxy");
        });
    }
})
