var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async');

var NotificationCategoryResource = module.exports = resources.MongooseResource.extend(
    {
        init:function () {
            this._super(models.Notification);
            this.allowed_methods = ['get', 'put'];
            this.authentication = new common.SessionAuthentication();
            this.update_fields = {name:null};
            this.default_query = function (query) {
                return query.sort('update_date', 'descending');
            };
            this.fields = {
                _id:null,
                user_id:null,
                notificators:{
                    first_name:null,
                    last_name:null,
                    avatar_url:null
                },
                description_of_notificators:null,
                message_of_notificators:null,
                update_date:null,
                link:null,
                pic:null
            }
        },

        get_objects:function (req, filters, sorts, limit, offset, callback) {
            var user_id = req.query.user_id;
            if (!user_id && req.user)
                user_id = req.user._id;

            if (user_id)
                filters['user_id'] = user_id;


            this._super(req, filters, sorts, limit, offset, function (err, results) {
                //formulate notifications
                var notificator_ids = _.chain(results.objects)
                    .map(function (notification) {
                        return notification.notificators.length ? notification.notificators[0].notificator_id : null;
                    })
                    .compact()
                    .uniq()
                    .value();

                var discussion_notification_types = [
                    "comment_on_discussion_you_are_part_of",
                    "change_suggestion_on_discussion_you_are_part_of",
                    "comment_on_discussion_you_created",
                    "change_suggestion_on_discussion_you_created",
                    "approved_change_suggestion_you_created",
                    "approved_change_suggestion_you_graded",
                    "been_quoted"
                ];

                var discussion_ids = _.chain(results.objects)
                    .map(function (notification) {
                        return  _.indexOf(discussion_notification_types, notification.type) > -1
                            ? notification.entity_id : null;
                    })
                    .compact()
                    .uniq()
                    .value();

                async.parallel([
                    function(cbk){
                        models.User.find({}, ['id', 'first_name', 'last_name', 'facebook_id', 'avatar'])
                            .where('_id').in(notificator_ids).run(function (err, users) {

                                if(!err){
                                    var users_hash = {};

                                    _.each(users, function (user) {
                                        users_hash[user.id] = user;
                                    });
                                }
                                cbk(err, users_hash);
                            });
                    },

                    function(cbk){
                        models.Discussion.find({}, ['id', 'image_field_preview'])
                            .where('_id').in(discussion_ids).run(function (err, discussions) {

                                if(!err){
                                    var discussions_hash = {};

                                    _.each(discussions, function (discussion) {
                                        discussions_hash[discussion.id] = discussion;
                                    });
                                }
                                cbk(err, discussions_hash);
                            });
                    }
                ], function(err, args){
                    async.forEach(results.objects, iterator(args[0], args[1]), function (err, obj) {
                        callback(err, results);
                    })
                })
            });
        }
    });


var iterator = function (users_hash, discussions_hash) {
    return function (notification, itr_cbk) {
        {
            var description_of_notificators;
            var message_of_notificators;
            var user_obj = notification.notificators.length ?
                users_hash[notification.notificators[0].notificator_id] : null;

            switch (notification.type) {
                case "approved_info_item":
                    notification.message_of_notificators =
                        "פריט מידע שהצעת התקבל"
                    ;
                    notification.link = "/information_items/" + notification.entity_id;
                    models.InformationItem.findById(notification.entity_id, function (err, info_item) {
                        if (!err)
                            notification.pic = info_item.image_field_preview;

                        itr_cbk(err);
                    });
                    break;
                case "comment_on_discussion_you_are_part_of":
                    var num_of_comments = notification.notificators.length;
                    notification.link = "/discussions/" + notification.entity_id;
                    notification.pic = discussions_hash[notification.entity_id].image_field_preview || discussions_hash[notification.entity_id].image_field;

                    if (num_of_comments > 1) {
                        description_of_notificators = num_of_comments + " " +
                            "אנשים"
                        ;
                        message_of_notificators =
                            " הגיבו על דיון שאתה חלק ממנו"
                        ;
                        notification.description_of_notificators = description_of_notificators;
                        notification.message_of_notificators = message_of_notificators;

                        itr_cbk();
                    } else {
                        notification.description_of_notificators = user_obj.first_name + " " + user_obj.last_name;
                        notification.message_of_notificators =
                            "הגיב על דיון שאתה חלק ממנו"
                        ;
                        itr_cbk()
                    }
                    break;
                case "change_suggestion_on_discussion_you_are_part_of":
                    var num_of_comments = notification.notificators.length;
                    notification.link = "/discussions/" + notification.entity_id;
                    notification.pic = discussions_hash[notification.entity_id].image_field_preview || discussions_hash[notification.entity_id].image_field;

                    if (num_of_comments > 1) {
                        notification.description_of_notificators = num_of_comments + " " + "אנשים";
                        notification.message_of_notificators =
                            " הגיבו על הצעה לשינוי שלקחת בה חלק"
                        ;
                        itr_cbk()
                    } else {

                        notification.description_of_notificators = user_obj.first_name + " " + user_obj.last_name;
                        notification.message_of_notificators =
                            "הגיב על הצעה לשינוי שלקחת בה חלק"
                        ;
                        itr_cbk();
                    }
                    break;
                case "comment_on_discussion_you_created" :
                    var num_of_comments = notification.notificators.length;
                    notification.link = "/discussions/" + notification.entity_id;
                    notification.pic = discussions_hash[notification.entity_id].image_field_preview || discussions_hash[notification.entity_id].image_field;

                    if (num_of_comments > 1) {
                        notification.description_of_notificators = num_of_comments + " " + "אנשים";
                        notification.message_of_notificators =
                            " הגיבו על דיון שיצרת"
                        ;
                        itr_cbk(null, 1);
                    } else {

                        notification.description_of_notificators = user_obj.first_name + " " + user_obj.last_name;
                        notification.message_of_notificators =
                            "הגיב על דיון שיצרת"
                        ;
                        notification.pic = user_obj.avatar_url();

                        itr_cbk();

                    }
                    break;
                case "change_suggestion_on_discussion_you_created":
                    var num_of_comments = notification.notificators.length;
                    notification.link = "/discussions/" + notification.entity_id;
                    notification.pic = discussions_hash[notification.entity_id].image_field_preview || discussions_hash[notification.entity_id].image_field;

                    if (num_of_comments > 1) {
                        notification.description_of_notificators = num_of_comments + " " + "אנשים";
                        notification.message_of_notificators =
                            " הגיבו על הצעה לשינוי שיצרת"
                        ;
                        itr_cbk();
                    } else {

                        notification.description_of_notificators = user_obj.first_name + " " + user_obj.last_name;
                        notification.message_of_notificators =
                            "הגיב על הצעה שלינוי שיצרת"
                        ;

                        itr_cbk();
                    }
                    break;
                case "approved_change_suggestion_you_created":
                    notification.message_of_notificators =
                        "התקבלה הצעה לשינוי שהצעת"
                    ;
                    notification.link = "/discussions/" + notification.entity_id;
                    notification.pic = discussions_hash[notification.entity_id].image_field_preview || discussions_hash[notification.entity_id].image_field;

                    itr_cbk();
                    break;
                case "approved_change_suggestion_you_graded":
                    notification.message_of_notificators =
                        "התקבלה הצעה לשינוי שדירגת"
                    ;
                    notification.link = "/discussions/" + notification.entity_id;
                    notification.pic = discussions_hash[notification.entity_id].image_field_preview || discussions_hash[notification.entity_id].image_field;

                        itr_cbk();
                    break;
                case "been_quoted":

                    notification.link = "/discussions/" + notification.entity_id + '#post_' + notification.notificators[0].sub_entity_id;
                    notification.pic = discussions_hash[notification.entity_id].image_field_preview || discussions_hash[notification.entity_id].image_field;
                    notification.description_of_notificators = user_obj.first_name + " " + user_obj.last_name;
                    notification.message_of_notificators =
                        "ציטט אותך"
                    ;
                    itr_cbk()
                    break;
                default:
                    itr_cbk();
            }
        }
    };
};

var is_item_in_arr = function(item, arr){


        return  _.any(arr, function(arr_item){return arr_item == item});

    }
