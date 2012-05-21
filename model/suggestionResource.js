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
    notifications = require('./notifications');

var SuggestionResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.Suggestion, 'suggestion', /*common.getGamificationTokenPrice('suggestion')*/2);
        this.allowed_methods = ['get', 'post', 'put'];
//        this.authorization = new Authoriztion();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id:null};
        this.default_query = function (query) {
            return query.sort('creation_date', 'descending').populate('creator_id');
        };

        this.fields = {
            creator_id : {
                id:null,
                first_name:null,
                last_name:null,
                avatar_url:null,
                facebook_id:null
            },
            parts:null,
            popularity:null,
            tokens:null,
            creation_date:null,
            agrees:null,
            not_agrees: null,
            evaluate_counter:null,
            grade:null,
            id:null,
            updated_user_tokens:null,
            grade_obj: {
                _id: null,
                evalueation_grade: null
            }
        };
    },

    get_objects: function (req, filters, sorts, limit, offset, callback) {

        var self = this;

        var iterator = function(suggestion, itr_cbk){
            if(req.user){
                models.GradeSuggestion.findOne({user_id: req.user._id, suggestion_id: suggestion._id}, ["_id", "evaluation_grade"], function(err, grade_sugg_obj){
                    if(!err)
                        suggestion.grade_obj = grade_sugg_obj;

                    itr_cbk(err, suggestion);
                });
            }
            else{
                suggestion.grade_obj = {};
                itr_cbk(null, suggestion);
            }
        }

        self._super(req, filters, sorts, limit, offset, function(err, results){

            if(err)
                callback(err, null);
            else
                async.forEach(results.objects, iterator, function(err, objs){
                    callback(err, results);
                });
        });
    },

    create_obj:function (req, fields, callback) {
        var user_id = req.session.user_id;
        var self = this;
        var suggestion_object = new self.model();
        var isNewFollower = false;
        var user = req.user;
        var discussion_id;
        var discussion_creator_id;

        var iterator = function(user_schema, itr_cbk){
            if (user_schema.user_id == user_id)
                itr_cbk(null, 0);
            else{
                if (discussion_creator_id == user_schema.user_id){
                    notifications.create_user_notification("change_suggestion_on_discussion_you_created", discussion_id, user_schema.user_id, user_id, function(err, results){
                        itr_cbk(err, results);
                    });
                }else{
                    notifications.create_user_notification("change_suggestion_on_discussion_you_are_part_of", discussion_id, user_schema.user_id, user_id, function(err, results){
                        itr_cbk(err, results);
                    });
                }
            }
        }

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
                    discussion_id = data.discussion_id;
                    cbk(err,data);
                });
            },

            function (suggestion_obj, cbk) {
                async.parallel([
                    //add user to praticipants
                    function (cbk2) {
                        models.Discussion.update({_id:suggestion_object.discussion_id, "users.user_id": {$ne: user_id}},
                            {$addToSet: {users: {user_id: user_id, join_date: Date.now}}},
                        cbk2);
                    },

                    //add notification for the dicussion's participants or creator
                    function(cbk2){
                        models.Discussion.findById(suggestion_object.discussion_id, /*["users", "creator_id"],*/ function(err, disc_obj){
                            if (err)
                                cbk2(err, null);
                            else{
                                discussion_creator_id = disc_obj.creator_id;
                                async.forEach(disc_obj.users, iterator, cbk2);
                            }
                        })
                    }
                ], function(err,results)
                {
                    cbk(err, suggestion_obj);
                });
            }
        ], function (err, result) {
            callback(err, result);
        });
    },

    update_obj:function (req, suggestion_object, callback) {
        //if suggestion approved we change the discussion vision
        // + save the ealier version of vison as parts in vison_changes
        var discussion_id = suggestion_object.discussion_id;
        var g_discussion_obj;
        var vision_changes;
        if (suggestion_object.is_approved) {
            callback({message:"this suggestion is already published", code: 401}, null);
        } else {

            async.waterfall([

                function(cbk){
                    var vision_changes_array = [];
                    models.Discussion.findOne({_id:discussion_id}, cbk);
                },

                function(discussion_object, cbk){
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
                    models.Discussion.update({_id:discussion_id}, {$addToSet: {vision_text_history: discussion_object.vision_text}, $set:{vision_text: new_string}}, function(err, counter){
                        cbk(err, discussion_object);
                    });

//                    discussion_object.save(cbk);
                },

                function(disc_obj, cbk){
                    g_discussion_obj = disc_obj;
                    suggestion_object.is_approved = true;
                    suggestion_object.save(cbk);
                }
            ], function(err, suggestion){
                callback(err, g_discussion_obj);
            })
        }
    }
});

module.exports.approveSuggestion = function(id,callback)
{
    //if suggestion approved we change the discussion vision
    // + save the ealier version of vison as parts in vison_changes
    var suggestion_object;
    var suggestion_creator;
    var discussion_id;

    var iterator = function(grade, itr_cbk){
        if(suggestion_creator != grade.user_id){
            notifications.create_user_notification("approved_change_suggestion_you_graded",
                    discussion_id, suggestion_creator, null, null, itr_cbk);
        }else{
            itr_cbk(null, 0);
        }
    }

    async.waterfall([
        function(cbk)
        {
            models.Suggestion.findById(id, cbk);
        },

        function(_suggestion_object,cbk){
            suggestion_object = _suggestion_object;
            if (suggestion_object.is_approved) {
                callback({message:"this suggestion is already published", code: 401}, null);
            } else {
                discussion_id = suggestion_object.discussion_id;
                var vision_changes_array = [];
                models.Discussion.findOne({_id:discussion_id}, cbk);
            }
        },

        function(discussion_object, cbk){
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
            models.Discussion.update({_id:discussion_object._id},
                {
                    $addToSet: {vision_text_history: discussion_object.vision_text},
                    $set:{vision_text: new_string}},
                function(err, counter){
                cbk(err, discussion_object);
            });
        },

        function(disc_obj, cbk){
            suggestion_object.is_approved = true;
            suggestion_object.save(cbk);
        },


        function(sug_obj, num, cbk){
            var debug = 8;
            suggestion_creator = sug_obj.creator_id;
            async.parallel([
                //set gamification
                function(par_cbk){
                    models.User.update({_id: sug_obj.creator_id}, {$inc: {"gamification.approved_suggestion": 1}}, function(err, obj){
                        par_cbk(err, obj);
                    });
                },

                //set notifications for creator
                function(par_cbk){
                    notifications.create_user_notification("approved_change_suggestion_you_created",
                            discussion_id, sug_obj.creator_id, null, null, function(err, obj){
                            par_cbk(err, obj);
                        });
                },

                //set notifications for graders
                function(par_cbk){

                    async.waterfall([
                        function(wtr_cbk){
                            models.GradeSuggestion.find({_id: sug_obj._id}, wtr_cbk);
                        },

                        function(grades, wtr_cbk){
                            async.forEach(grades, iterator, function(err, result){
                                wtr_cbk(err || null, result || 0);
                            });
                        }
                    ], function(err, args){
                        par_cbk(err, args);
                    });
                }
            ], function(err, args){
                cbk(err, 8);
            })
        }
    ], function(err, arg){
        callback(err, arg);
    });
}
