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
    async = require('async'),
    CHANGE_SUGGESTION_PRICE = 2;

/*
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
 };*/

var SuggestionResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.Suggestion, 'suggestion', CHANGE_SUGGESTION_PRICE);
        this.allowed_methods = ['get', 'post', 'put'];
//        this.authorization = new Authoriztion();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id:null};
        this.default_query = function (query) {
            return query.sort('creation_date', 'descending');
        };
        //    this.validation = new resources.Validation();=
    },
    create_obj:function (req, fields, callback) {
        var user_id = req.session.user_id;
        var self = this;
        var suggestion_object = new self.model();
        var isNewFollower = false;
        var user = req.user;

        fields.creator_id = user_id;
        fields.first_name = user.first_name;
        fields.last_name = user.last_name;

        for (var field in fields) {
            suggestion_object.set(field, fields[field]);
        }

        async.waterfall([
            function (cbk) {
                self.authorization.edit_object(req, suggestion_object, cbk);
            },

            function (suggestion_obj, cbk) {
                suggestion_object.save(function(err,data){
                    cbk(err,data);
                });
            },

            function (suggestion_obj, cbk) {

                if (common.isArgIsInList(suggestion_obj.discussion_id, user.discussions) == false) {
                    var inc_discussion_followers_count = {};
                    inc_discussion_followers_count["followers_count"] = 1;
                    async.parallel([
                        function (cbk2) {
                            models.User.update({_id:user_id}, {$addToSet:{discussions:suggestion_obj.discussion_id}}, cbk2);
                        },

                        function (cbk2) {
                            models.Discussion.update({_id:suggestion_object.discussion_id}, {$addToSet:{users:user._id}}, {$inc:inc_discussion_followers_count}, cbk2);
                        }
                    ], function(err,results)
                    {
                        cbk(null,suggestion_obj);
                    });
                } else {
                    cbk(null,suggestion_obj);
                }
            }
        ], function (err, result) {
            console.log(result);
            callback(self.elaborate_mongoose_errors(err), result);
        });
    },

    update_obj:function (req, suggestion_object, callback) {
        //if suggestion approved we change the discussion vision
        // + save the ealier version of vison as parts in vison_changes
        var discussion_id = suggestion_object.discussion_id;
        var vision_changes;
        if (suggestion_object.is_approved) {
            callback({message:"this suggestion is already published", code: 401}, null);
        } else {
            suggestion_object.is_approved = true;
            var vision_changes_array = [];
            models.Discussion.findOne({_id:discussion_id}, function (err, discussion_object) {
                var vision = discussion_object.vision_text;
                var new_string = "";
                var curr_position = 0;
                var parts = suggestion_object.parts;

                //changing the vision and save changes that have been so i can reverse it in change_vision
                for (var i = 0; i < parts.length; i++) {
                    //                changed_text = vision.slice(parts[i].start, parseInt(parts[i].end) + 1);
                    new_string += vision.slice(curr_position, parts[i].start);
                    new_string += parts[i].text;
                    curr_position = parseInt(parts[i].end) + 1;
                    //                vision_changes_array.push({start: parts[i].start, end: parts[i].end, text : changed_text});

                    //                discussion_object.vision_changes.push({start: parts[i].start, end: parts[i].end, text : changed_text});
                }
                new_string += vision.slice(curr_position);
                //            discussion_object.vision_changes.push(vision_changes_array);
                discussion_object.vision_text_history.push(discussion_object.vision_text);
                discussion_object.vision_text = new_string;
                discussion_object.save();
            });
            suggestion_object.save(callback);
        }
    }
});
