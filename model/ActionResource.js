/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 06/03/12
 * Time: 17:23
 * To change this template use File | Settings | File Templates.
 */


var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common');
    ACTION_PRICE = 2;

var ActionResource = module.exports = common.GamificationMongooseResource.extend(
    {
        init: function(){
            this._super(models.Action, 'action');
            this.allowed_methods = ['get', 'post', 'put'];
            this.filtering = {category: null};
            this.authentication = new common.SessionAuthentication();
            this.authorization = new common.TokenAuthorization();
        },

        create_obj: function(req,fields,callback){
            var user_id = req.session.user_id;
            var self = this;
            var action_object = new self.model();

            models.User.findById(user_id,function(err,user){
                if(err)
                {
                    callback(err, null);
                }
                else
                {
                    fields.creator_id = user_id;
                    fields.first_name = user.first_name;
                    fields.last_name = user.last_name;
                    fields.users = user_id;
                    for(var field in fields)
                    {
                        action_object.set(field,fields[field]);
                    }
                    self.authorization.edit_object(req, action_object, function(err, user_object)
                    {
                        if(err) callback(err);
                        else
                        {
                            var discussion_id = action_object.discussion_id;
                            action_object.save(function(err,object)
                            {
//                                var discussion_id = object.discussion_id;

                                if (!err){
                                /*    models.Discussion.update({_id:user_id},{$addToset: {users: user_id}},function(err, object)
                                    {
                                        if (err){
                                            callback(self.elaborate_mongoose_errors(err), null);
                                        }
                                    });*/

                                    user_object.tokens -= ACTION_PRICE;
                                    // add discussion_id and action_id to the lists in user
                                    /*models.User.update({_id:user_id},{$addToset: {discussions: discussion_id, actions: action_object._id}},function(err, object)
                                    {
                                        if (err){
                                            callback(self.elaborate_mongoose_errors(err), null);
                                        }
                                    });*/
                                    user_object.save(function(err, object){
                                        callback(self.elaborate_mongoose_errors(err), action_object);
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
});



