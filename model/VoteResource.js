/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 01/03/12
 * Time: 11:31
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common');

//Authorization
/*var Authoriztion = function() {};
util.inherits(Authoriztion,resources.Authorization);

Authoriztion.prototype.limit_object_list = Authoriztion.prototype.limit_object = function(req, query, callback){

    if(req.session.auth.user){
        var id = req.session.user_id;

        if (req.method == "PUT" || req.method  == "DELETE"){
            query.where('is_published', false).where('creator_id', id);
            callback(null, query);
        }else{
            query.or([{ 'is_published': true }, {'creator_id': id }]);
            callback(null, query);
        }
    }else{
        callback("Error: User Is Not Authenticated", null);
    }
};*/

/*Authoriztion.prototype.edit_object = function(req,object,callback){
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
                if (object.tokens >= req.body.tokens){
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
};*/

var VoteResource = module.exports = function(){

    VoteResource.super_.call(this,models.Vote);
    this.allowed_methods = ['get','post'];
//    this.authorization = new Authoriztion();
    this.authentication = new common.SessionAuthentication();
    this.filtering = {discussion_id: null};
}

util.inherits(VoteResource, resources.MongooseResource);

VoteResource.prototype.create_obj = function(req,fields,callback)
{
    var self = this;
    //check if user has enought tokens, if so reduce it from user tokens and adds/redueces it form post tokens
    if(req.session.user_id){
        var user_id = req.session.user_id;
        models.User.findOne({_id :user_id},function(err,user_object)
        {
            if(err)
            {
                callback(err, null);
            }
            else
            {
                if (user_object.tokens >= req.body.tokens){
                    var post_id = req.body.post_id;
                    var method = req.body.method;
                    models.Post.findOne({_id :post_id},function(err,post_object){
                        if (err){
                            callback(err, null);
                        }
                        else{
                            var discussion_id = post_object.discussion_id;
                            var isNewFollower = false;
                            user_object.tokens -= parseInt(req.body.tokens);
                            if (method == 'add'){
                                post_object.tokens += parseInt(req.body.tokens);
                            }
                            else{
                                post_object.tokens -= parseInt(req.body.tokens);
                            }

                            var vote_object = new self.model();
                            fields.user_id = user_id;
                            fields.post_id = post_id;
                            fields.tokens = req.body.tokens;

                            post_object.save();

                            //check if is user is a new follower, if so insert discussion to user and increade followers in discussion
                            if (common.isDiscussionIsInUser(discussion_id, user_object.discussions) == false){
                                user_object.discussions.push(discussion_id);
                                isNewFollower = true;
                            }
                            user_object.save();

                            if (isNewFollower){
                                models.Discussion.findOne({_id :discussion_id},function(err, discussion_object){
                                    if (err){

                                    }else{
                                        discussion_object.followers_count++;
                                        discussion_object.save();
                                    }
                                });
                            }
                            for( var field in fields)
                            {
                                vote_object.set(field,fields[field]);
                            }
                            self.authorization.edit_object(req, vote_object, function(err,object)
                            {
                                if(err) callback(err);
                                else
                                {
                                    object.save(function(err,object)
                                    {
                                        if (err){
                                        callback(err, null);
                                    }
                                        callback(self.elaborate_mongoose_errors(err),object);
                                    });
                                }
                            });
                        }
                    });
                }else{
                    callback("Error: there is not enought tokens", null);
                }
            }
        });
    }
    else{
        callback("Error: User Is Not Autthenticated", null);
    }
}

