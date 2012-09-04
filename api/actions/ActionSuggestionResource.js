
var common = require('../common.js'),
    util  = require('util'),
    jest = require('jest'),
    models = require('../../models'),
    async = require('async'),
    GradeSuggestionResource = require('./../GradeSuggestionResource'),
    notifications = require('./../notifications');

ActionSuggestionResource = module.exports = common.GamificationMongooseResource.extend({

    init:function () {
        this._super(models.ActionSuggestion, 'action_suggestion', 0);
        this.allowed_methods = ['get', 'post'];
        this.authentication = new common.SessionAuthentication();
        this.filtering = {action_id:null, is_approved:null};
        this.default_query = function (query) {
            return query.sort({'creation_date':'descending'}).populate('creator_id');
        };
    },

    create_obj:  function(req, fields, callback){

        var user = req.user;
        var user_id = user.id;
        var suggestion_object = new self.model();
        var action_creator_id;

        fields.creator_id = user_id;
        fields.first_name = user.first_name;
        fields.last_name = user.last_name;

        var iterator = function (user_schema, itr_cbk) {
            if (user_schema.user_id == user_id.id || !user_schema.user_id)
                itr_cbk(null, 0);
            else {
                //TODO - set notifications
//                if (action_creator_id == user_schema.user_id) {
//                    notifications.create_user_notification("change_suggestion_on_discussion_you_created", discussion_id, user_schema.user_id, user_id, suggestion_object._id, function (err, results) {
//                        itr_cbk(err, results);
//                    });
//                } else {
//                    notifications.create_user_notification("change_suggestion_on_discussion_you_are_part_of", discussion_id, user_schema.user_id, user_id, suggestion_object._id, function (err, results) {
//                        itr_cbk(err, results);
//                    });
//                }

                itr_cbk(null, 0);
            }
        }

        for (var field in fields) {
            suggestion_object.set(field, fields[field]);
        }

        async.waterfall([
            //first, check if there is a suggestion with the same indexes
            function (cbk) {
                models.ActionSuggestion.find({action_id:fields.action_id, is_approved:false}, cbk);
            },

            function (suggestions, cbk) {
                var err;
                var sug;
                var action_thresh;

                _.each(suggestions, function (suggestion) {
                    if ((suggestion.parts[0].start >= fields.parts[0].start && suggestion.parts[0].start <= fields.parts[0].end)
                        || (suggestion.parts[0].end >= fields.parts[0].start && suggestion.parts[0].end <= fields.parts[0].end)) {
                        err = true;
                        sug = suggestion._id;
                    }
                })
                if (err)
                    cbk({message:"a suggestion with this indexes already exist"});
                else
                    models.Action.findById(fields.action_id, cbk);
            },

            function (action_obj, cbk) {

                var word_count = suggestion_object.getCharCount();
                suggestion_object.threshold_for_accepting_the_suggestion = GradeSuggestionResource.calculate_sugg_threshold(word_count,
                    Number(action_obj.admin_threshold_for_accepting_change_suggestions) || Number(action_obj.threshold_for_accepting_change_suggestions));
                self.authorization.edit_object(req, suggestion_object, cbk);
            },

            function (suggestion_obj, cbk) {
                suggestion_object.save(function (err, data) {
//                    if (data) {
//                        action_id = data.action_id;
//                        data.creator_id.id = user.id;
//                        data.creator_id.first_name = user.first_name;
//                        data.creator_id.last_name = user.last_name;
//                        data.creator_id.avatar_url = user.avatar_url();
//                        data.creator_id.score = user.score;
//                        data.creator_id.num_of_given_mandates = user.num_of_given_mandates;
//                        data.creator_id.num_of_proxies_i_represent = user.num_of_proxies_i_represent;
//                        suggestion_obj.wanted_amount_of_tokens = suggestion_obj.threshold_for_accepting_the_suggestion;
//                    }
                    cbk(err, data);
                });
            },

            function (suggestion_obj, cbk) {
                async.parallel([
                    //add notification for the dicussion's participants or creator
                    //add user to praticipants

                    function (cbk2) {
                        models.Action.findById(suggestion_object.action_id, /*["users", "creator_id"],*/ function (err, action_obj) {
                            if (err)
                                cbk2(err, null);
                            else {
                                if (!_.any(action_obj.users, function (user) {
                                    return user.user_id + "" == req.user.id
                                })) {
                                    var new_user = {user_id:req.user._id, join_date:Date.now()};
                                    models.Action.update({_id:action_obj._id}, {$addToSet:{users:new_user}}, function (err, num) {
                                        action_creator_id = action_obj.creator_id;
                                        async.forEach(action_obj.users, iterator, cbk2);
                                    });
                                } else {
                                    action_creator_id = action_obj.creator_id;
                                    async.forEach(action_obj.users, iterator, cbk2);
                                }
                            }
                        })
                    },

                    //set notifications for users that i represent (proxy)
                    function (cbk2) {
                        //TODO - set notifications
//                        models.User.find({"proxy.user_id":user_id}, function (err, slaves_users) {
//                            async.forEach(slaves_users, function (slave, itr_cbk) {
//                                notifications.create_user_notification("proxy_created_change_suggestion", suggestion_obj._id, slave._id, user_id, discussion_id, function (err, result) {
//                                    itr_cbk(err);
//                                })
//                            }, function (err) {
//                                cbk2(err);
//                            })
//                        })
                        cbk2();
                    }
                ], function (err) {
                    cbk(err, suggestion_obj);
                });
            }
        ], function (err, result) {
            if (err) {
                console.error(err);
                console.trace();
            }
            callback(err, result);
        });
    }
});

//TODO - approve actionSuggestion
module.exports.approveSuggestion = function (id, callback) {
    callback("not implemnted yet!");
};

