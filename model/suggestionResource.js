/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 05/03/12
 * Time: 18:12
 * To change this template use File | Settings | File Templates.
 */

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
    CHANGE_SUGGESTION_PRICE = 2;



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

                if (object.tokens >= CHANGE_SUGGESTION_PRICE){
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

var SuggestionResource = module.exports = function(){

    SuggestionResource.super_.call(this,models.Suggestion);
    this.allowed_methods = ['get','post', 'put'];
    this.authorization = new Authoriztion();
    this.authentication = new common.SessionAuthentication();
    this.filtering = {discussion_id: null};
    this.default_query = function(query)
    {
        return query.sort('creation_date','descending');
    };
//    this.validation = new resources.Validation();=
}

util.inherits(SuggestionResource, resources.MongooseResource);

SuggestionResource.prototype.create_obj = function(req,fields,callback)
{
    var user_id = req.session.user_id;
    var self = this;
    var suggestion_object = new self.model();
    var isNewFollower = false;

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
                suggestion_object.set(field,fields[field]);
            }

            self.authorization.edit_object(req, suggestion_object,function(err, user_object)
            {
                if(err) callback(err);
                else
                {
                    suggestion_object.save(function(err,suggestion_object)
                    {
                        //if suggestion created successfuly, take tokens from the user and add discussion to user
                        // + increase discussion_followers
                        // + user to discussion
                        if (!err){
                            user_object.tokens -= CHANGE_SUGGESTION_PRICE;
                            if (common.isDiscussionIsInUser(suggestion_object.discussion_id, user_object.discussions) == false){
                                user_object.discussions.push(suggestion_object.discussion_id);
                                isNewFollower = true;
                            }

                            if (isNewFollower){
                                models.Discussion.findOne({_id: suggestion_object.discussion_id}, function(err, discussion_object){
                                    if (err){
                                        callback(err, null);
                                    }else{
                                        discussion_object.users.push(user_id);
                                        discussion_object.followers_count++;
                                        discussion_object.save();
                                    }
                                });
                            }

                            user_object.save(function(err, object){
                                callback(self.elaborate_mongoose_errors(err), suggestion_object);
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

SuggestionResource.prototype.update_obj = function(req,suggestion_object,callback){
    //if suggestion aproved we change the discussion vision
    // + save the ealier version of vison as parts in vison_changes
    var discussion_id = suggestion_object.discussion_id;
    var vision_changes;
    if(suggestion_object.is_aproved){
        callback("this suggestion is already published", null);
    }else{
        suggestion_object.is_aproved = true;

        models.Discussion.findOne({_id: discussion_id}, function(err, discussion_object){
            var vision = discussion_object.vision_text;
            var new_string = "";
            var curr_position = 0;
            var parts = suggestion_object.parts;
            var changed_text;
            for (var i = 0; i < parts.length; i++){
                changed_text = vision.slice(parts[i].start, parts[i].end + 1);
                new_string += vision.slice(curr_position, parts[i].start);
                new_string += parts[i].text;
                curr_position = parseInt(parts[i].end) + 1;
                discussion_object.vision_changes.push({start: parts[i].start, end: parts[i].end, text : changed_text});
            }
            new_string += vision.slice(curr_position);
            discussion_object.vision_text = new_string;
            discussion_object.save();
        });
        suggestion_object.save(callback);
    }
}
