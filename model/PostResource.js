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
                    callback({message:"Error: Unauthorized - there is not enought tokens",code:401}, null);
                }
            }
        });
    }
    else{
        callback({message:"Error: User Is Not Autthenticated",code:401}, null);
    }
};

var PostResource = module.exports = common.GamificationMongooseResource.extend({
    init: function(){

        this._super(models.Post,'post');
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
});

//util.inherits(PostResource, resources.MongooseResource);

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

            self.authorization.edit_object(req, post_object, function(err, user_object)
            {
                if(err) callback(err);
                else
                {
                    var discussion_id = post_object.discussion_id;
                    post_object.save(function(err,object)
                    {
                        var discussion_id = object.discussion_id;
                        //if post created successfuly, add user to discussion
                        // + add discussion to user
                        //  + take tokens from the user
                        if (!err){

                           models.Discussion.findOne({_id: object.discussion_id}, function(err, discussion_obj){
                                if (err){
                                    callback(self.elaborate_mongoose_errors(err), null);
                                }else{

                                    if (common.isUserIsInDiscussion(user_id, discussion_obj.users) == false){
                                        discussion_obj.users.push(user_id);
                                        discussion_obj.followers_count++;
                                        discussion_obj.save();
                                    }
                                }
                            });

                            // add discussion_id to the list of discussions in user
                            user_object.tokens -= POST_PRICE;
                            if (common.isDiscussionIsInUser(object.discussion_id, user_object.discussions) == false){
                                user_object.discussions.push(object.discussion_id);
                            }
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


