/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 23/02/12
 * Time: 12:03
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),

    POST_PRICE = 1;




//Authorization
var Authoriztion = function() {};
util.inherits(Authoriztion,resources.Authorization);

Authoriztion.prototype.edit_object = function(req,object,callback){

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
//                if (req.body.is_change_suggestion){
//                    price = change_suggestion_price;
//                }else{
//                    price = post_price;
//                }

                if (object.tokens >= POST_PRICE){
                    callback(null, object);
                }else{
                    callback("Error: Unauthorized - there is not enought tokens", null);
                }
            }
        });
    }
    else{
        callback("Error: User Is Not Autthenticated", null);
    }
};

var PostResource = module.exports = function(){

    PostResource.super_.call(this,models.Post);
    this.allowed_methods = ['get','post'];
    this.authorization = new Authoriztion();
    this.authentication = new common.SessionAuthentication();
    this.filtering = {discussion_id: null};
    this.default_query = function(query)
    {
        return query.sort('creation_date','descending');
    };
//    this.validation = new resources.Validation();=
}

util.inherits(PostResource, resources.MongooseResource);

PostResource.prototype.create_obj = function(req,fields,callback)
{
    var user_id = req.session.user_id;
    var self = this;
    var post_object = new self.model();

    models.User.findOne({_id :user_id},function(err,user){
        if(err)
        {
            callback(err, null);
        }
        else
        {
            fields.creator_id = user_id;
            fields.first_name = user.first_name;
            fields.last_name = user.last_name;

            for( var field in fields)
            {
                post_object.set(field,fields[field]);
            }

            self.authorization.edit_object(req, post_object,function(err, user_object)
            {
                if(err) callback(err);
                else
                {
                    post_object.save(function(err,object)
                    {
                        //if post created successfuly, take tokens it from the user
                        if (!err){

                            /*if (object.is_change_suggestion){
                                price = change_suggestion_price;
                            }*/
                            user_object.tokens -= POST_PRICE;
                            user_object.save(function(err, object){
                                callback(self.elaborate_mongoose_errors(err), post_object);
                            });
                        }else{
                            callback(self.elaborate_mongoose_errors(err), null);
                        }
                    });
                }
            });
        }
    });
}