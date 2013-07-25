var resources = require('jest'),
    models = require('../../models'),
    common = require('../common.js'),
    async = require('async'),
    og_action = require('../../og/og.js').doAction,
    _ = require('underscore'),
    notifications = require('../notifications.js');

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
        this.filtering = {subject_id:null, users:null, is_published:null, is_private:null, tags:null,
            'users.user_id':{
                exact:true,
                in:true
            }
        };
        this.authorization = new Authorization();
        this.default_query = function (query) {
            return query.sort({creation_date:'descending'});
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
            followers_count: null,
            participants_count: null,
            evaluate_counter: null,
            _id:null,
            is_follower: null,
            grade: null,
            last_updated: null,

            grade_obj:{
                grade_id:null,
                value:null
            }
        };
        this.update_fields = {
            title:null,
            image_field:null,
            subject_id:null,
            subject_name:null,
            creation_date:null,
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
	    if(err) return callback(err);	   

            var user_discussions;

            if (req.user)
                user_discussions = req.user.discussions;

            _.each(results.objects || [], function (discussion) {
                discussion.participants_count = discussion.users ? discussion.users.length : 0;
                discussion.is_follower = false;
                if (user_discussions) {
                    if (_.find(user_discussions, function (user_discussion) {
                        return user_discussion.discussion_id + "" == discussion._id + "";
                    })) {
                        discussion.is_follower = true;
                    }
                }
            });

            callback(err, results);
        });
    },

    create_obj:function (req, fields, callback) {
        var user_id = req.session.user_id;
        var self = this;
        var object = new self.model();
        var user = req.user;
        var created_discussion_id;
        var info_items;
        var number_of_taged_info_items;

        if(fields.text_field)
            fields.text_field_preivew = fields.text_field.substr(0,365);
        if(!fields.image_field)
            fields.image_field = { url:'/images/' + fields.subject_id + '.jpg',path:'/images/' + fields.subject_id + '.jpg'};
        if(fields.image_field)
            fields.image_field_preview = fields.image_field;

        var min_tokens = common.getGamificationTokenPrice('min_tokens_to_create_dicussion') > -1 ? common.getGamificationTokenPrice('min_tokens_to_create_dicussion') : 10;
//        var total_tokens = user.tokens + user.num_of_extra_tokens;

        var iterator = function (info_item, itr_cbk) {
            info_item.discussions.push(created_discussion_id);

            for (var i = 0; i < info_item.users.length; i++) {
                if (info_item.users[i] == req.session.user_id) {
                    info_item.users.splice(i, 1);
                    i--;
                }
            }
            info_item.save(itr_cbk());
        };

        /**
         * Waterfall:
         * 1) get user shopping cart information items
         * 2) check if has enough tokens, get subject
         * 3) set fields, send to authorization
         * 4) save the discussion object
         * 5) remove information items from user shopping cart
         * 6) add discussion to user discussions (as a follower)
         * 7) set gamification details, create notifications
         *      7.1) find all information items and set notifications for their owners
         *      7.2) set notification for users that i'm their proxy
         *      7.3) create new DiscussionHistory schema for this Discussion
         * 8) publish to facebook
         *
         * Final) return discussion object (or error)
         */
        async.waterfall([

            // 1) get user shopping cart information items
            function(cbk) {
                models.InformationItem.find({users:req.user._id},cbk);
            },

            // 2) check if has enough tokens, get subject
            function(_info_items,cbk) {
                info_items = _info_items;
                number_of_taged_info_items = info_items.length;
                var user_cup = 9 + user.num_of_extra_tokens;

                //conditions for creating a new discussion

                var is_good_flag = true;
                if (user_cup < min_tokens && user_cup < min_tokens - (Math.min(Math.floor(number_of_taged_info_items / 2), 2)) && fields.subject_id != '4fd0dae0ded0cb0100000fde') {
                    console.log(false);
                    cbk({message:"you don't have the min amount of tokens to open discussion", code:401}, null);
                }
                else {
                    console.log(true);
                    //vision cant be more than 800 words, title can't be more than 75 letters
                    var vision_splited_to_words = fields.text_field.split(" ");
                    var words_counter = 0;
                    var title_length = fields.title.length;

                    _.each(vision_splited_to_words, function (word) {
                        if (word != " " && word != "") words_counter++
                    });
                    if (words_counter >= 800) {
                        cbk({message:"vision can't be more than 800 words", code:401}, null);
                    } else if(title_length > 75) {
                        cbk({message:"title can't be longer than 75 characters", code:401}, null);
                    } else {

                        //get subject_name
                    models.Subject.findById(fields.subject_id, cbk);
                    }
                }
            },

            // 3) set fields, send to authorization
            function(subject,cbk) {
                fields.subject_name = subject.name;
                fields.creator_id = user_id;
                fields.first_name = user.first_name;
                fields.last_name = user.last_name;
                fields.users = {
                    user_id:user_id,
                    join_date:Date.now()
                };
                fields.is_published = true; //TODO this is only for now
                // create text_field_preview - 200 chars
                if (fields.text_field.length >= 200)
                    fields.text_field_preview = fields.text_field.substr(0, 200);
                else
                    fields.text_field_preview = fields.text_field;

                for (var field in fields) {
                    object.set(field, fields[field]);
                }

                req.gamification_type = "discussion";

                //set create_discussion_ price
                // for each tagging of 2 information items the price is minus 1 tokens
                // the max discount is 3;
                var price_discount = (Math.min(Math.floor(number_of_taged_info_items / 2), 3));
                req.token_price = common.getGamificationTokenPrice('create_discussion') > -1 ? common.getGamificationTokenPrice('create_discussion') - price_discount : 3;
                self.authorization.edit_object(req, object, cbk);
            },

            // 4) save the discussion object
            function(object,cbk) {
                object.save(function (err, object) {
                    cbk(err,object)
                });
            },

            // 5) remove information items from user shopping cart
            function(obj,cbk) {
                created_discussion_id = obj._id;

                //add info items to discussion shopping cart and delete it from user's shopping cart
                async.forEach(info_items, iterator, function (err) {
                    cbk(err);
                });
            },

            // 6) add discussion to user discussions (as a follower)
            function(cbk) {
                var user_discussion = {
                    discussion_id:object._id,
                    join_date:Date.now()
                };

                if (object.is_published)
                    models.User.update({_id:user._id}, {$addToSet:{discussions:user_discussion}},function(err) {
                        cbk(err);
                    });
                else
                    callback(null,object);
            },

            // 7) set gamification details, create notifications
            function(cbk, arg) {

                //set gamification

                async.parallel([
                    //find all information items and set notifications for their owners
                    function(cbk1){
                        // first - continue
                        cbk1();

                        // second - create notifications and send mails
                        notifications_for_the_info_items_relvant(object._id, user_id, object.subject_id, function(err) {
                            if(err){
                                console.error(err);
                            }else{
                                console.log("notification of new discussion were created successfully")
                            }
                        });
                    },

                    //set notification for users that i'm their proxy
                    function(cbk1){
                        models.User.find({"proxy.user_id": user_id}, function(err, slaves_users){
                            async.forEach(slaves_users, function(slave, itr_cbk){
                                notifications.create_user_notification("proxy_created_new_discussion", object._id, slave._id, user_id, null, '/discussions/' + object._id, function(err, result){
                                    itr_cbk(err);
                                })
                            }, function(err){
                                cbk1(err);
                            })
                        })
                    },

                    // create new DiscussionHistory schema for this Discussion
                    function(cbk1){
                        var discussion_history = new models.DiscussionHistory();

                        discussion_history.discussion_id = object._id;
                        discussion_history.date = Date.now();
                        discussion_history.text_field = object.text_field;

                        discussion_history.save(cbk1);
                    },

                    // update actions done by user
                    function(cbk1){
                        models.User.update({_id:user._id},{$set: {"actions_done_by_user.create_object": true}}, function(err){
                            cbk1(err);
                        });
                    }

                ], function(err){
                    cbk(err);
                })
            },

            // 8) publish to facebook
            function(cbk) {
                og_action({
                    action: 'created',
                    object_name:'discussion',
                    object_url : '/discussions/' + object.id,
                    fid : user.facebook_id,
                    access_token:user.access_token,
                    user:user
                });
		        cbk();
            }
        ],
            // Final) return discussion object
            function(err) {
            callback(err,object);
        });
    },

    update_obj:function (req, object, callback) {
        var user = req.user;
        if (req.query.put == "follower") {
            var disc = _.find(user.discussions, function (discussion) {
                return discussion.discussion_id + '' == object._id + '';
            });
            if (!disc) {
                async.parallel([
                    //add user to followers in users.discussions
                    function (cbk2) {
                        var user_discussion = {
                            discussion_id:object._id,
                            join_date:Date.now()
                        }
                        models.User.update({_id:user._id}, {$addToSet:{discussions:user_discussion}}, cbk2);
                    },

                    //increase discussion followers and add user to "people that connected somhow to discussion" if its a new user..
                    function (cbk2) {
                        var connected_somehow_user = _.find(object.users, function (user) {
                            return user.user_id + '' == user._id + '';
                        });
                        if (!connected_somehow_user) {
                            //if new user that "connected somehow to the discussion" so add to set it
                            var discussion_user = {
                                user_id: user._id,
                                join_date:Date.now()
                            }
                            models.Discussion.update({_id:object._id}, {$inc:{followers_count:1}, $addToSet:{users: discussion_user}}, cbk2);
                        }else{
                            //only increase num of followers
                            models.Discussion.update({_id:object._id}, {$inc:{followers_count:1}}, cbk2);
                        }
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
                    req.token_price = common.getGamificationTokenPrice('create_discussion') > -1 ? common.getGamificationTokenPrice('create_discussion') : 3;
                    object.is_published = true;

                    object.save(function (err, disc_obj) {
                        notifications_for_the_info_items_relvant(disc_obj._id, user._id, disc_obj.subject_id, function (err) {
                            if(err)
                                callback(err);
                            else {
                                // publish to facebook
                                if(!object.is_private) {
                                    og_action({
                                        action: 'created',
                                        object_name:'discussion',
                                        object_url : '/discussions/' + object.id,
                                        fid : user.facebook_id,
                                        access_token:user.access_token,
                                        user:user
                                    });
                                }
                                callback(err,object);
                            }
                        })
                    });
                }
            }
        }
    }
});

function notifications_for_the_info_items_relvant(discussion_id, notificator_id, subject_id, callback) {

    var set_notification_for_liked_items = function (like, itr_cbk) {
        if (like.info_item_creator + "" != like.user_id + "" && like.info_item_creator != null) {
            notifications.create_user_notification("a_dicussion_created_with_info_item_that_you_like",
                like.info_item_id, like.user_id, notificator_id, discussion_id, '/discussions/' + discussion_id, itr_cbk);
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
                        info_item._id, creator_id, notificator_id, discussion_id, '/discussions/' + discussion_id, par_cbk);
                } else {
                    par_cbk(null, 0);
                }
            }
        ], function (err, args) {
            itr_cbk(err, args);
        })
    }

    var new_discussion_notification_itr = function (user, itr_cbk) {

        // check if user is not the notificator and if user chosen to get this notification in mail configuration
        if ( user._id + "" != notificator_id + "" && _.any(user.mail_notification_configuration.new_discussion, function(discussion){
            return discussion.subject_id + "" == subject_id + "" && discussion.get_alert  }))
        {
            notifications.create_user_notification("new_discussion",
                discussion_id, user._id, notificator_id, null, '/discussions/' + discussion_id, itr_cbk);
        }else{
            itr_cbk();
        }
    }

    async.parallel([

        // notifications related to info items
        function(par_cbk){
            async.waterfall([
                function (cbk) {
                    models.InformationItem.find({discussions:discussion_id}, cbk);
                },

                function (info_items, cbk) {
                    async.forEach(info_items, iterator, cbk);
                }], function (err, arg) {
                par_cbk(err, arg);
            })
        },

        // notifications about new discussion
        function(par_cbk){

            async.waterfall([

                // find users that chosen to get notifications about new discussions of this subject
                function (cbk) {
                    models.User.find({"mail_notification_configuration.get_mails": true, "mail_notification_configuration.new_discussion" : {$elemMatch : { subject_id : subject_id + "", get_alert : true}}}, cbk);
                   /* models.User.find()
                    .where("mail_notification_configuration.new_discussion").elemMatch(function (elem) {
                        elem.where('subject_id', subject_id+ "");
                        elem.where('get_alert', true)
                    })
//                    .where("mail_notification_configuration.get_mails", true)
                    .exec(cbk);*/
                },

                // create site notifications and mail notifications
                function (users, cbk) {
//                   users = _.each(users, ))
                    async.forEach(users, new_discussion_notification_itr, cbk);
                }
            ], function (err) {
                par_cbk(err);
            })
        }
    ], function(err){
        callback(err);
    })
}



