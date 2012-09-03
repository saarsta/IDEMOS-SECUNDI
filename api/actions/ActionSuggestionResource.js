
var common = require('../common.js'),
    util  = require('util'),
    jest = require('jest'),
    models = require('../../models'),
    async = require('async'),

    ACTION_SUGGESTION_PRICE = 2;

ActionSuggestionResource = module.exports = common.GamificationMongooseResource.extend({

    init:function () {
        this._super(models.ActionSuggestion, 'action_suggestion', 0);
        this.allowed_methods = ['get', 'post', 'put'];
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
        

//        var user_id = req.session.user_id;
//        var g_user = null;
//        var self = this;
//        var action_suggestion = new this.model();
//
//        async.waterfall([
//            function(cbk){
//                models.User.findById(user_id, cbk);
//            },
//
//            function(user, cbk){
//                g_user = user;
//                fields.creator_id = user_id;
//                fields.first_name = user.first_name;
//                fields.last_name = user.last_name;
//
//                for (var field in fields){
//                    action_suggestion.set(field, fields[field]);
//                }
//
//                self.Authorization.edit_object(req, action_suggestion, cbk);
//            },
//
//            function (action,cbk) {
//
//                async.parallel([
//                    function(cbk2)
//                    {
//                        // insert circle to user.circles
//
//                    },
//
//                    function(cbk2)
//                    {
//                        // increase circles.followers
//
//                    },
//
//                    function(cbk2)
//                    {
//                        action.save(function(err, action_sugg){
//                            cbk(err, action_sugg);
//                        });
//                    }
//                ], cbk);
//            },
//
//            function(args, cbk){
//                g_user.save(function(err, user){
//                    cbk(err, user);
//                });
//            }
//        ], function(err, callback){
//            callback(self.elaborate_mongoose_errors(err), action_suggestion);
//        });

        fields.creator_id = user_id;
        fields.first_name = user.first_name;
        fields.last_name = user.last_name;

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
                var discussion_thresh;

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
                    models.ACtion.findById(fields.action_id, cbk);
            },

            function (action_obj, cbk) {

                var word_count = suggestion_object.getCharCount();
                suggestion_object.threshold_for_accepting_the_suggestion = calculate_sugg_threshold(word_count,
                    Number(action_obj.admin_threshold_for_accepting_change_suggestions) || Number(action_obj.threshold_for_accepting_change_suggestions));
                self.authorization.edit_object(req, suggestion_object, cbk);
            },

            function (suggestion_obj, cbk) {
                suggestion_object.save(function (err, data) {
                    if (data) {
                        discussion_id = data.discussion_id;
                        data.creator_id.id = user.id;
                        data.creator_id.first_name = user.first_name;
                        data.creator_id.last_name = user.last_name;
                        data.creator_id.avatar_url = user.avatar_url();
                        data.creator_id.score = user.score;
                        data.creator_id.num_of_given_mandates = user.num_of_given_mandates;
                        data.creator_id.num_of_proxies_i_represent = user.num_of_proxies_i_represent;
                        suggestion_obj.wanted_amount_of_tokens = suggestion_obj.threshold_for_accepting_the_suggestion;
                    }
                    cbk(err, data);
                });
            },

            function (suggestion_obj, cbk) {
                async.parallel([
                    //add notification for the dicussion's participants or creator
                    //add user to praticipants

                    function (cbk2) {
                        models.Discussion.findById(suggestion_object.discussion_id, /*["users", "creator_id"],*/ function (err, disc_obj) {
                            if (err)
                                cbk2(err, null);
                            else {
                                if (!_.any(disc_obj.users, function (user) {
                                    return user.user_id + "" == req.user.id
                                })) {
                                    var new_user = {user_id:req.user._id, join_date:Date.now()};
                                    models.Discussion.update({_id:disc_obj._id}, {$addToSet:{users:new_user}}, function (err, num) {
                                        discussion_creator_id = disc_obj.creator_id;
                                        async.forEach(disc_obj.users, iterator, cbk2);
                                    });
                                } else {
                                    discussion_creator_id = disc_obj.creator_id;
                                    async.forEach(disc_obj.users, iterator, cbk2);
                                }
                            }
                        })
                    },

                    //set notifications for users that i represent (proxy)
                    function (cbk2) {
                        models.User.find({"proxy.user_id":user_id}, function (err, slaves_users) {
                            async.forEach(slaves_users, function (slave, itr_cbk) {
                                notifications.create_user_notification("proxy_created_change_suggestion", suggestion_obj._id, slave._id, user_id, discussion_id, function (err, result) {
                                    itr_cbk(err);
                                })
                            }, function (err) {
                                cbk2(err);
                            })
                        })

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
