var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async'),
    _ = require('underscore'),
    notifications = require('./notifications');

//Authorization
var Authorization = common.TokenAuthorization.extend({
    limit_object_list:function (req, query, callback) {

        if (req.method == "PUT" || req.method == "DELETE") {
            id = req.user._id;
//            query.where('is_published', false).where('creator_id', id);
            callback(null, query);
        } else {
            if (req.method == "GET") {
                query.where('is_published', true);
                callback(null, query);
            } else {
                callback(null, query);
            }
        }
    },
    limit_object:function (req, query, callback) {
        return this.limit_object_list(req, query, callback);
    }
});

var DiscussionResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.Discussion, null, 0);
        this.allowed_methods = ['get', 'post', 'put', 'delete'];
        this.authentication = new common.SessionAuthentication();
        this.filtering = {subject_id:null, users:null, is_published:null, tags:null,
            'users.user_id':{
                exact:true,
                in:true
            }
        };
        this.authorization = new Authorization();
        this.default_query = function (query) {
            return query.sort('creation_date', 'descending');
        },
        this.fields = {
            title:null,
            tooltip_or_title:null,
            image_field:null,
            image_field_preview:null,
            subject_id:null,
            subject_name:null,
            creation_date:null,
            creator_id:null,
            first_name:null,
            last_name:null,
            text_field_preview:null,
            text_field:null,
            num_of_approved_change_suggestions:null,
            is_cycle:null,
            tags:null,
            followers_count:null,
            evaluate_counter:null,
            _id:null,
            is_follower:null,
            grade:null,

            grade_obj:{
                grade_id:null,
                value:null
            }
        };
        this.update_fields = {
            title:null,
            image_field:null,
            image_field_preview:null,
            subject_id:null,
            subject_name:null,
            creation_date:null,
            text_field_preview:null,
            text_field:null,
            tags:null
        };
    },

    get_discussion:function (object, user, callback) {
        if (object) {

            object.is_follower = false;

            if (user) {
                if (_.find(user.discussions, function (user_discussion) {
                    return user_discussion.discussion_id + "" == object._id
                })) {
                    object.is_follower = true;
                }

                models.Grade.findOne({user_id:user._id, discussion_id:object._id}, function (err, grade) {
                    if (err) {
                        callback(err, object);
                    }
                    else {
                        if (grade) {
                            object.grade_obj = {};
                            object.grade_obj["grade_id"] = grade._id;
                            object.grade_obj["value"] = grade.evaluation_grade;
                        }
                    }
                    callback(err, object);
                });
            } else {
                callback(null, object);
            }
        } else {
            callback({message:"internal error", code:500}, object);
        }
    },

    get_object:function (req, id, callback) {
        var self = this;
        self._super(req, id, function (err, object) {
            self.get_discussion(object, req.user, callback);
        })
    },

    get_objects:function (req, filters, sorts, limit, offset, callback) {

        if (req.query.get == "myUru") {
            var user_id = req.query.user_id || req.user._id;

            filters['users.user_id'] = user_id;
        }

        this._super(req, filters, sorts, limit, offset, function (err, results) {

            var user_discussions;

            if (req.user)
                user_discussions = req.user.discussions;

            _.each(results.objects, function (discussion) {
                discussion.is_follower = false;
                if (user_discussions) {
                    if (_.find(user_discussions, function (user_discussion) {
                        return user_discussion.discussion_id + "" == discussion._id + "";
                    })) {
                        discussion.is_follower = true;
                    }
                }
            })

            callback(err, results);
        });
    },

    create_obj:function (req, fields, callback) {
        var user_id = req.session.user_id;
        var self = this;
        var object = new self.model();
        var user = req.user;
        var created_discussion_id;

        var min_tokens = /*common.getGamificationTokenPrice('create_discussion')*/ 10;
//        var total_tokens = user.tokens + user.num_of_extra_tokens;

        var iterator = function (info_item, itr_cbk) {
            info_item.discussions.push(created_discussion_id);

            for (var i = 0; i < info_item.users.length; i++) {
                if (object.users[i] == req.session.user_id) {
                    object.users.splice(i, 1);
                    i--;
                }
            }
            info_item.save(itr_cbk());
        }

        models.InformationItem.find({users:req.user._id}, function (err, info_items) {
            if (!err) {
                var count = info_items.length;
                if (user.tokens < min_tokens && user.tokens < min_tokens - (Math.min(Math.floor(count / 2), 2))) {
                    callback({message:"user must have a least 10 tokens to open create discussion", code:401}, null);
                }
                else {
                    //vision cant be more than 800 words
                    var vision_splited_to_words = fields.text_field.split(" ");
                    var words_counter = 0;

                    _.each(vision_splited_to_words, function (word) {
                        if (word != " " && word != "") words_counter++
                    })
                    if (words_counter >= 800) {
                        callback({message:"vision can't be more than 800 words", code:401}, null);
                    } else {

                        //get subject_name
                        models.Subject.findById(fields.subject_id, function (err, subject) {
                            if (!err) {
                                fields.subject_name = subject.name;
                                fields.creator_id = user_id;
                                fields.first_name = user.first_name;
                                fields.last_name = user.last_name;
                                fields.users = {
                                    user_id:user_id,
                                    join_date:Date.now()
                                };
                                fields.is_published = true; //TODO this is only for now
                                fields.is_hidden = false;
                                // create text_field_preview - 200 chars
                                if (fields.text_field.length >= 200)
                                    fields.text_field_preview = fields.text_field.substr(0, 200);
                                else
                                    fields.text_field_preview = fields.text_field;

                                for (var field in fields) {
                                    object.set(field, fields[field]);
                                }

                                self.authorization.edit_object(req, object, function (err, object) {
                                    if (err) callback(err);
                                    else {
                                        //if success with creating new discussion - add discussion to user schema
                                        object.save(function (err, obj) {
                                            if (!err) {
                                                created_discussion_id = obj._id;

                                                //add info items to discussion shopping cart and delete it from user's shopping cart
                                                async.forEach(info_items, iterator, function (err, result) {
                                                    if (!err) {
                                                        var user_discussion = {
                                                            discussion_id:obj._id,
                                                            join_date:Date.now()
                                                        }

                                                        if (object.is_published) {
                                                            models.User.update({_id:user._id}, {$addToSet:{discussions:user_discussion}}, function (err, num) {
                                                                if (!err) {

                                                                    //set gamification
                                                                    req.gamification_type = "discussion";
                                                                    req.token_price = /*common.getGamificationTokenPrice('discussion')*/ 3;

                                                                    //find all information items and set notifications for their owners
                                                                    notifications_for_the_info_items_relvant(obj._id, user_id, function (err, args) {
                                                                        callback(err, obj);
                                                                    })
                                                                } else
                                                                    callback(err, obj);
                                                            });
                                                        } else {
                                                            callback(err, obj);
                                                        }
                                                    } else {
                                                        callback(err, object);
                                                    }
                                                })
                                            } else {
                                                callback(err, object);
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                callback(err, null);
                            }
                        })
                    }
                }
            } else {
                callback(err, null);
            }
        })
    },

    update_obj:function (req, object, callback) {
        var user = req.user;
        if (req.query.put == "follower") {
            var disc = _.find(user.discussions, function (discussion) {
                return discussion.discussion_id + '' == object._id + '';
            });
            if (!disc) {
                async.parallel([
                    function (cbk2) {
                        var user_discussion = {
                            discussion_id:object._id,
                            join_date:Date.now()
                        }
                        models.User.update({_id:user._id}, {$addToSet:{discussions:user_discussion}}, cbk2);
                    },

                    function (cbk2) {
                        models.Discussion.update({_id:object._id}, {$inc:{followers_count:1}, $addToSet:{users:user._id}}, cbk2);
                    }
                ], function () {
                    object.followers_count++;
                    object.is_follower = true;
                    callback(null, object);
                });
            } else {
                callback({message:"user is already a follower", code:401}, null);
            }
        } else {
            if (req.query.put == "leave") {

                async.waterfall([
                    function (cbk) {
                        var disc = _.find(user.discussions, function (discussion) {
                            return discussion.discussion_id + '' == object._id + '';
                        });

                        if (disc) {
                            //delete this discussion
                            user.discussions.splice(_.indexOf(user.discussions, disc));
                            user.save(cbk);
                        } else {
                            callback({message:"user is not a follower", code:401}, null);
                        }
                    },

                    function (obj, cbk) {
                        models.Discussion.update({_id:object._id}, {$inc:{followers_count:-1}}, function (err, num) {
                            object.followers_count--;
                            object.is_follower = false;

                            callback(err, object);
                        });
                    }
                ], function (err, result) {
                    callback(err, object);
                })
            } else {
                if (object.is_published) {
                    callback("this discussion is already published", null);
                } else {
                    req.gamification_type = "discussion";
                    req.token_price = common.getGamificationTokenPrice('discussion');
                    object.is_published = true;

                    object.save(function (err, disc_obj) {
                        notifications_for_the_info_items_relvant(disc_obj._id, user._id, function (err, args) {
                            callback(err, args);
                        })
                    });
                }
            }
        }
    }
});

function notifications_for_the_info_items_relvant(discussion_id, notificator_id, callback) {

    var set_notification_for_liked_items = function (like, itr_cbk) {
        if (like.info_item_creator + "" != like.user_id + "" && like.info_item_creator != null) {
            notifications.create_user_notification("a_dicussion_created_with_info_item_that_you_like",
                discussion_id, like.user_id, notificator_id, like.info_item_id, itr_cbk);
        } else {
            itr_cbk(null, 0);
        }
    }

    var iterator = function (info_item, itr_cbk) {

        var creator_id = null;
        if (info_item.created_by)
            creator_id = info_item.created_by.creator_id;

        async.parallel([

            //set notifications for people that like the items
            function (par_cbk) {
                async.waterfall([
                    function (cbk) {
                        models.Like.find({info_item_id:info_item._id}, cbk);
                    },

                    function (likes, cbk) {
                        _.each(likes, function (like) {
                            like.info_item_creator = creator_id
                        });
                        async.forEach(likes, set_notification_for_liked_items, cbk);
                    }

                ], function (err, arg) {
                    par_cbk(err, arg);
                })
            },

            //set notifications for information item's creators
            function (par_cbk) {
                if (creator_id) {
                    notifications.create_user_notification("a_dicussion_created_with_info_item_that_you_created",
                        discussion_id, creator_id, notificator_id, info_item._id, par_cbk);
                } else {
                    par_cbk(null, 0);
                }
            }
        ], function (err, args) {
            itr_cbk(err, args);
        })
    }

    async.waterfall([
        function (cbk) {
            models.InformationItem.find({discussions:discussion_id}, cbk);
        },

        function (info_items, cbk) {
            async.forEach(info_items, iterator, cbk);
        }
    ], function (err, arg) {
        callback(err, arg);
    })
}

