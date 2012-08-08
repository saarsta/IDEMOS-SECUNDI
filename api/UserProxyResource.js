var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async'),
    _ = require('underscore');

var Authorization = resources.Authorization.extend({
    edit_object : function(req,object,callback){
        if(req.user){
            if (object._id + "" == req.user._id + ""){
                if(req.user._id + "" == req.body.proxy_id + "")
                    callback({message:"אינך יכול/ה לתת מנדטים לעצמך", code: 401}, null);
                else
                    if(req.body.req_number_of_tokens > object.tokens)
                        callback({message:"אין לך מספיק אסימונים", code: 401}, null);
                    else
                    {
                        callback(null, object);

                    }

            }
            else
                callback({message:"קרתה תקלה", code: 401}, null);
        }else{
            callback({message: "קרתה תקלה", code: 401}, null);
        }
    },

    limit_object_list: function(req, query, callback){
        if(req.user){
            var user_id = req.user._id;

            query.where('_id', user_id);
            callback(null, query);
        }else{
            callback({message: "קרתה תקלה", code: 401}, null);
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
            ugly_proxy: null,
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
                    num_of_given_mandates: null,
                    score: null,
                    num_of_proxies_i_represent: null
                },
                number_of_tokens: null,
                number_of_tokens_to_get_back: null,

                //this number is the number of mandates that i gave to the proxy minus the number of mandates that i want to get back
                //even if the action of getting the mandates back didn't happen yet
                calc_num_of_mandates: null
            },
            tokens: null,
            daily_tokens: null
        };
        this.update_fields = {

        };

//        this.default_query = function(query){
//            return query.populate("followers.follower_id");
//        };

    },

    run_query: function(req,query,callback)
    {
        if(req.method == 'GET' || 'PUT'){
            query.populate("proxy.user_id");
        };
        this._super(req,query,callback);
    },

    get_object: function(req, id, callback){
      this._super(req, id, function(err, obj){
          if(obj){
                obj.daily_tokens = 9 + obj.num_of_extra_tokens;
                _.each(obj.proxy, function(proxy){proxy.calc_num_of_mandates = proxy.number_of_tokens - proxy.number_of_tokens_to_get_back;})
          }
         callback(err, obj);
      })
    },

    update_obj: function (req, object, callback) {
        //proxy is a list of people for whom i gave my mandates, and it saved in my schema
        var proxy_id = req.body.proxy_id;
        var number_of_tokens = req.body.req_number_of_tokens;
        var proxy = _.find(object.proxy, function(proxy_user){
            var id = proxy_user.user_id ? proxy_user.user_id._id + "" : -1;
            return id == proxy_id + ""
        });

        var self = this;
        var base = this._super;
        var is_new_proxy = false;

        if(!proxy)
        {
            proxy = {
                user_id: proxy_id,
                number_of_tokens: 0,
                number_of_tokens_to_get_back: 0
            };

            is_new_proxy = true;
        }

        //edit proxy's mandates(tokens)
        if (req.body.req_number_of_tokens > 0){

            if(proxy.number_of_tokens_to_get_back){
                //first of all reduce mandates from "number_of_tokens_to_get_back"
                if(req.body.req_number_of_tokens <= proxy.number_of_tokens_to_get_back){
                    proxy.number_of_tokens_to_get_back -= req.body.req_number_of_tokens;
                    number_of_tokens = 0;
                }else{
                    number_of_tokens = req.body.req_number_of_tokens - proxy.number_of_tokens_to_get_back;
                    proxy.number_of_tokens_to_get_back = 0;
                }
            }


            proxy.number_of_tokens += Number(number_of_tokens);
            //reduce tokens from my tokens
            object.tokens -= number_of_tokens;


            //set notification here


        }else{
            //tokens will be removed once a day by a cron
            proxy.number_of_tokens_to_get_back = proxy.number_of_tokens_to_get_back || 0;
            proxy.number_of_tokens_to_get_back += (Number(number_of_tokens) * -1);
        }

        if(is_new_proxy)
            object.proxy.push(proxy);

        if(proxy.number_of_tokens > 3)
            callback({message:"אי אפשר לתת יותר משלושה מנדטים", code: 401}, null)
        else if (proxy.number_of_tokens_to_get_back > proxy.number_of_tokens)
            callback({message:"קרתה תקלה", code: 401}, null)
        else{
            //save user object

                //why the guck is it pn user????
                object.number_of_tokens = 0;
                object.number_of_tokens_to_get_back = 0;

            base.call(self, req, object, function(err, user_obj){
                //i can't populate proxy if he was just created, thats ia why i have created ugly_proxy

                if(user_obj){
                    user_obj.ugly_proxy = null;
                     _.each(user_obj.proxy, function(proxy){proxy.calc_num_of_mandates = proxy.number_of_tokens - proxy.number_of_tokens_to_get_back;})
                }
                    if(!err && number_of_tokens > 0){
                    //update proxy-user new tokens
                    var inc = is_new_proxy ? 1 : 0;
                    models.User.update({_id: proxy_id}, {$inc: {num_of_given_mandates: number_of_tokens, num_of_proxies_i_represent: is_new_proxy}}, function(err, num){

                        if(is_new_proxy){
                            //if this is the a new proxy i need to populate it manualy
                            models.User.findById(proxy_id, function(err, user){
                                if(!err){
                                    var user_id = {
                                        _id: user._id,
                                        facebook_id: user.facebook_id,
                                        avatar_url: user.avatar_url,
                                        first_name: user.first_name,
                                        last_name: user.last_name,
                                        num_of_given_mandates: user.num_of_given_mandates,
                                        score: user.score,
                                        num_of_proxies_i_represent: user.num_of_proxies_i_represent
                                    }

                                    proxy.user_id = user_id;
                                    user_obj.ugly_proxy =  user_id;
                                }
//                                _.each(user_obj.proxy, function(curr_proxy){if(curr_proxy.user_id + "" == proxy_id){curr_proxy.user_id = proxy}});
                                callback(err, user_obj);
                            })
                        }else
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
            if(object.proxy[i].user_id._id + "" == req.body.proxy_id)
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
            }else
                callback({message: "קרתה תקלה"});
        });
    }
})
