var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async');
    _  = require('underscore');

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
                    sub_entity_id: null,
                    notificator_id: null,
                    ballance: null,
                    votes_for: null,
                    votes_against: null,
                    first_name:null,
                    last_name:null,
                    avatar_url:null
                },
                entity_id: null,
                description_of_notificators:null,
                message_of_notificators:null,
                name: null,
                update_date:null,
                link:null,
                pic:null,
                html_version: null,
                html_version_1: null,
                part_one: null,
                part_tow: null,
                part_three: null,
                extra_link: null,
                link_to_first_comment_user_didnt_see: null,
                discussion_link: null,

                //for the share part
                img_src: null,
                title: null,
                text_preview: null

            }
        },

        get_objects:function (req, filters, sorts, limit, offset, callback) {
            var user_id = req.query.user_id;
            if (!user_id && req.user)
                user_id = req.user._id;

            if (user_id)
                filters['user_id'] = user_id;

            // save user last visit to now
            if(req.user) {
                req.user.last_visit = Date.now();
                req.user.save(function(err) {
                    if(err) {
                        console.error('saving user last_visit failed',err);
                    }
                    else
                        console.log('saved last visit for ' + req.user + ' ' + req.user.last_visit);
                });
            }


            this._super(req, filters, sorts, limit, offset, function (err, results) {

                if(err)
                    callback(err);
                else
                    populateNotifications(results,function(err, results){
                        callback(err, results);
                    });
            });
        }
    });


var iterator = function (users_hash, discussions_hash, info_items_hash) {
    return function (notification, itr_cbk) {
        {
            var description_of_notificators;
            var message_of_notificators;
            var user_obj = notification.notificators.length ?
                users_hash[notification.notificators[0].notificator_id] : null;

            var discussion = discussions_hash[notification.entity_id + ''] || discussions_hash[notification.notificators[0].sub_entity_id + ''];
            switch (notification.type) {
                case "approved_info_item_i_created":
                    notification.message_of_notificators =
"פריט מידע שיצרת התקבל למערכת"
                    ;
                    notification.link = "/information_items/" + notification.entity_id;
                    notification.pic = info_items_hash[notification.entity_id].image_field_preview
                        || info_items_hash[notification.notificators[0].sub_entity_id].image_field;

                    notification.title=info_items_hash[notification.entity_id].title;
                    itr_cbk();
                    break;
//                case "approved_info_item_i_liked":
//                    notification.message_of_notificators =
//                        "פריט מידע שעשית לו לייק התקבל"
//                    ;
//                    notification.link = "/information_items/" + notification.entity_id;
//                    notification.pic = info_items_hash[notification.notificators[0].sub_entity_id].image_field_preview
//                        || info_items_hash[notification.notificators[0].sub_entity_id].image_field;
//                    itr_cbk();
//                    break;
                case "comment_on_discussion_you_are_part_of":

                    var num_of_comments = notification.notificators.length;
                    if(discussion){
                        notification.link = "/discussions/" + discussion._id + "";
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.name = discussion.title;

                        //for fb share
                        notification.img_src = notification.pic;
                        notification.title = 'דיון בחזון '
                        +
                            notification.name;
                        notification.text_preview = discussion.text_field_preview;

                        //find the first comment user didnt see
                       notification.link_to_first_comment_user_didnt_see = "/discussions/" + discussion._id + "#post_" +  notification.notificators[0].sub_entity_id;

                    }

                    if (num_of_comments > 1) {
                        description_of_notificators = num_of_comments + " " +
                            "תגובות"
                        ;

                        message_of_notificators =
"חדשות בדיון שהשתתפת בו - "                        ;
                        notification.description_of_notificators = description_of_notificators;
                        notification.message_of_notificators = message_of_notificators;

                        itr_cbk();
                    } else {
                        if(user_obj){
                            notification.description_of_notificators = user_obj.first_name + " " + user_obj.last_name;
                        }
                        notification.message_of_notificators =
                            "הגיב על דיון שהשתתפת בו - "
                        ;
                        itr_cbk()
                    }
                    break;
                case "change_suggestion_on_discussion_you_are_part_of":
                    var num_of_comments = notification.notificators.length;
                    notification.suggestions_link='/discussions/" + discussion._id + ""' + notification.notificators[0].sub_entity_id;
                    if(discussion){
                        notification.link = "/discussions/" + discussion._id + "";
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.name = discussion.title;

                        notification.img_src = notification.pic;
                        notification.title = 'דיון בחזון '
                            +
                            notification.name;
                        notification.text_preview = discussion.text_field_preview;
                    }
                    if (num_of_comments > 1) {
                        notification.description_of_notificators = num_of_comments + " " + "אנשים";
                        notification.message_of_notificators =
                            "העלו הצעה לשינוי בדיון שלקחת בו חלק - "
                        ;

                        itr_cbk()
                    } else {
                        if(user_obj){
                            notification.description_of_notificators = user_obj.first_name + " " + user_obj.last_name;
                        }
                        notification.message_of_notificators =
                            "העלה הצעה לשינוי בדיון שלקחת בו חלק - "
                        ;
                        itr_cbk();
                    }
                    break;
                case "comment_on_discussion_you_created" :
                    var num_of_comments = notification.notificators.length;
                    if(discussion){
                        notification.link = "/discussions/" + discussion._id + "";
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.name = discussion.title;

                        notification.img_src = notification.pic;
                        notification.title = 'דיון בחזון '
                            +
                            notification.name;
                        notification.text_preview = discussion.text_field_preview;
                    }
                    if (num_of_comments > 1) {
                        notification.description_of_notificators = num_of_comments + " " + "אנשים";
                        notification.message_of_notificators =
                           "הגיבו על דיון שיצרת - "
                        ;
                        itr_cbk(null, 1);
                    } else {
                        if(user_obj){
                            notification.description_of_notificators = user_obj.first_name + " " + user_obj.last_name;
                            notification.pic = user_obj.avatar_url();
                        }
                        notification.message_of_notificators =
                       "הגיב על דיון שיצרת - "
                        ;

                        itr_cbk();
                    }
                    break;
                case "change_suggestion_on_discussion_you_created":
                    var num_of_comments = notification.notificators.length;
                    if(discussion){
                        notification.link = "/discussions/" + discussion._id + "";
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.name = discussion.title;

                        notification.img_src = notification.pic;
                        notification.title = 'דיון בחזון '
                            +
                            notification.name;
                        notification.text_preview = notification.text_field_preview;
                    }
                    if (num_of_comments > 1) {
                        notification.description_of_notificators = num_of_comments + " " + "אנשים";
                        notification.message_of_notificators =
"הגיבו על הצעה לשינוי שהעלית בדיון - "

                        ;
                        itr_cbk();
                    } else {
                        if(user_obj){
                            notification.description_of_notificators = user_obj.first_name + " " + user_obj.last_name;
                        }
                        notification.message_of_notificators =
                            "הגיב על הצעה לשינוי שהעלת בדיון - "
                        ;
                        itr_cbk();
                    }
                    break;
                case "approved_change_suggestion_you_created":
                    notification.message_of_notificators =
                        "התקבלה הצעה לשינוי שהעלת בדיון - "
                    ;

                    if(discussion){
                        notification.name = discussion.title;
                        notification.link = "/discussions/" + discussion._id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;

                        notification.img_src = notification.pic;
                        notification.title = 'דיון בחזון '
                            +
                            notification.name;
                        notification.text_preview = discussion.text_field_preview;

                        notification.old_text= discussion.vision_text_history[discussion.vision_text_history.length - 1];
                        notification.new_text= discussion.text_field;
                    }
                    itr_cbk();
                    break;
                case "approved_change_suggestion_you_graded":
                    notification.message_of_notificators =
                        "התקבלה הצעה לשינוי שדירגת בדיון - "
                    ;

                    if(discussion){
                        notification.link = "/discussions/" + discussion._id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.name = discussion.title;

                        notification.img_src = notification.pic;
                        notification.title = 'דיון בחזון '
                            +
                            notification.name;
                        notification.text_preview = discussion.text_field_preview;

                        notification.old_text= discussion.vision_text_history[discussion.vision_text_history.length - 1];
                        notification.new_text= discussion.text_field;
                    }
                    itr_cbk();
                    break;
                case "been_quoted":
                    if(discussion){
                        notification.link = "/discussions/" + discussion._id + '#post_' + notification.notificators[0].sub_entity_id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.name = discussion.title;

                        notification.img_src = notification.pic;
                        notification.title = 'תגובה מתוך דיון על החזון '
                            +
                            notification.name;
//                        notification.text_preview = posts_hash[notification.entity_id + ""].text;
                        notification.text_preview = discussion.text_field_preview;

                        notification.quote_link= notification.link;
                        notification.discussion_link = "/discussions/" + discussion._id;
                    }
                    if(user_obj){
                         notification.description_of_notificators = user_obj.first_name + " " + user_obj.last_name;
                    }
                    notification.message_of_notificators =
                      "ציטט אותך בדיון - "
                    ;


//                    notification.user_quote= bugbug text.replace(/\[(?:quote|ציטוט)=(?:"|&quot;)([^"&]*)(?:"|&quot;)\s*\]\n?((?:.|\n)*)?\n?\[\/(?:quote|ציטוט)\]\n?/g,;
                    notification.user_quote = "";

                    itr_cbk()
                    break;
                case "a_dicussion_created_with_info_item_that_you_like":
                    notification.message_of_notificators =
                        "פריט מידע שעשית לו לייק תוייג בדיון - "
                    ;
                    if(discussion){
                        notification.link = "/information_items/" + notification.entity_id;
                      //  notification.pic = info_items_hash[notification.entity_id + ""].image_field_preview || info_items_hash[notification.entity_id + ""].image_field;
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.name = discussion.title;

                        notification.img_src = notification.pic;
                        notification.title = 'דיון בחזון '
                            +
                            notification.name;
                        notification.text_preview = discussion.text_field_preview;
                    }
                    itr_cbk();
                    break;
                case "user_gave_my_suggestion_tokens":
                    var num_of_users_that_vote_my_sugg = notification.notificators.length;

                        var latest_notificator = getLatestNotificator(notification.notificators);
                        notification.link = "/discussions/" + notification.notificators[0].sub_entity_id;
                        notification.link += "#post_" + notification.entity_id;
                        notification.name = discussions_hash[notification.notificators[0].sub_entity_id + ""] && discussions_hash[notification.notificators[0].sub_entity_id + ""].title;

                    if(user_obj){
                        notification.pic = user_obj.avatar_url();
                        notification.description_of_notificators = user_obj.first_name + " " + user_obj.last_name;
                    }
                    if(num_of_users_that_vote_my_sugg == 1){

                        var support_or_not = "התנגד ל";
                        if(notification.notificators[0].votes_for > 0 )
                            support_or_not = "תמך ב";

                        notification.message_of_notificators =
                            support_or_not
                        + "הצעה לשינוי שהעלת בדיון - "
                        ;
                    }else{
                        var token_sum = _.reduce(notification.notificators, function(sum, notificator){return sum + Number(notificator.ballance)}, 0);

                        var supprorts_sum = _.reduce(notification.notificators, function(sum, notificator){return sum + Number(notificator.votes_for)}, 0);
                        var against_sum = _.reduce(notification.notificators, function(sum, notificator){return sum + Number(notificator.votes_against)}, 0);

                        if(supprorts_sum && against_sum){
                            notification.description_of_notificators = supprorts_sum +
                                " " +
                                "חברי עורו"
                            ;
                            notification.message_of_notificators =
                                "תמכו בהצעה שהעלית (ו"
                                    + against_sum
                                    + " "
                                    + "התנגדו לה)"
                                + " "
 + "בדיון - "
                            ;
                        }else if (supprorts_sum){
                            notification.description_of_notificators = supprorts_sum +
                                " " +
                                "חברי עורו"
                            ;
                            notification.message_of_notificators =
                                "תמכו בהצעה שהעלית בדיון - "
                        }else if (against_sum){
                            notification.description_of_notificators = against_sum +
                                " " +
                                "חברי עורו"
                            ;
                            notification.message_of_notificators =
"התנגדו להצעה שהעלית בדיון - "
                        }
                    }
                    itr_cbk();
                    break;
                case "proxy_created_new_discussion":
                    notification.html_version = true;

                    notification.part_one = "" +
                        "נפתח דיון חדש על ידי "
                    if(discussion){
                        notification.link = "/discussions/" + notification.entity_id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.name = discussion.title;
                        notification.img_src = notification.pic;
                    }
                    if(user_obj){
                        notification.part_tow = user_obj.first_name + " " + user_obj.last_name;
                        notification.extra_link = "/myuru/" + user_obj._id;
                    }

                    notification.part_three =
           ", המייצג/ת אותך בעורו"

                    itr_cbk();
                    break;
                case "proxy_created_change_suggestion":
                    notification.html_version = true;

                    if(discussion){
                        notification.link = "/discussions/" + discussion._id + "#post_" + notification.entity_id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.name = discussion.title;
                        notification.img_src = notification.pic;
                    }

                    notification.part_one = "" +
                  "הועלתה הצעה לשינוי בדיון "
                    +
                        notification.name +
                    " " +
                        "על ידי";
                    if(user_obj){
                        notification.part_tow = user_obj.first_name + " " + user_obj.last_name;
                        notification.extra_link = "/myuru/" + user_obj._id;
                    }

                    notification.part_three =
           ", המייצג/ת אותך בעורו";

                    itr_cbk();
                    break;
                case "proxy_graded_change_suggestion":
                    notification.html_version = true;

                    if(discussion){
                        notification.link = "/discussions/" + discussion._id + "#post_" + notification.entity_id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.name = discussion.title;
                        notification.img_src = notification.pic;
                    }

                    var is_agree = notification.notificators[0].ballance > 0 ? "נתמכה " : "נדחתה ";
                    notification.part_one = "" +
                  "הצעה לשינוי בדיון "
                    +
                        notification.name +
                    " " +
                        is_agree +
                        "על ידי ";
                    if(user_obj){
                        notification.part_tow = user_obj.first_name + " " + user_obj.last_name;
                        notification.extra_link = "/myuru/" + user_obj._id;
                    }

                    notification.part_three =
           ", המייצג/ת אותך בעורו";

                    itr_cbk();
                    break;
                case "proxy_graded_discussion":
                    notification.html_version = true;

                    if(discussion){
                        notification.link = "/discussions/" + notification.entity_id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.name = discussion.title;
                        notification.img_src = notification.pic;
                    }

                    var grade = notification.notificators[0].ballance;

                    notification.part_one = "" +
                  "מסמך החזון בדיון "
                    +
                        notification.name +
                    " " +
                        "דורג "  +
                    grade +
                        " " +
                        "על ידי ";
                    if(user_obj){
                        notification.part_tow = user_obj.first_name + " " + user_obj.last_name;
                        notification.extra_link = "/myuru/" + user_obj._id;
                    }

                    notification.part_three =
           ", המייצג/ת אותך בעורו";
                    itr_cbk();
                    break;
                case "proxy_vote_to_post":

                    var balance = notification.notificators[0].ballance;
                    if(balance != 0){
                        notification.html_version = true;
                        var is_agree = balance > 0 ? "תמך בתגובה בדיון " : "התנגד לתגובה בדיון ";

                            notification.link = "/discussions/" + discussion._id + "#post_" + notification.entity_id;
                            notification.pic = discussion.image_field_preview || discussion.image_field;
                            notification.name = discussion.title;
                            notification.img_src = notification.pic;

                        if(user_obj){
                            notification.part_tow = user_obj.first_name + " " + user_obj.last_name;
                            notification.extra_link = "/myuru/" + user_obj._id;
                        }

                        notification.part_three =
                            ", המייצג/ת אותך בעורו,"
                                +
                                " "
                            +
                                is_agree
                                +
                                " "
                                +
                                notification.name  ;
                        itr_cbk();
                    }
                    else{
                        notification.remove(function(err, result){
                            itr_cbk();
                        });
                    }
                    break;
                case "user_gave_my_post_tokens":

                    var num_of_users_that_vote_my_post = 0;
                    var num_of_users_support = 0;
                    var num_of_users_against = 0;
                    var num_of_tokens = 0;

                    var support_users = [];
                    var against_users = [];

                    //first i count suppports/against, user whose balance is 0 dont count
                    _.each(notification.notificators, function(notificator){
                        var balance = notificator.ballance;
                        if(balance != 0){
                            num_of_users_that_vote_my_post++;
                            num_of_users_support += balance > 0 ? 1 : 0;
                            num_of_users_against += balance < 0 ? 1 : 0;
                            num_of_tokens += balance > 0 ? balance : 0;

                            if(balance > 0)
                                support_users.push(notificator.notificator_id);
                            else
                                against_users.push(notificator.notificator_id);
                        }
                    })


                    if(num_of_users_that_vote_my_post){
                        notification.html_version = true;

                        if(notification && notification.notificators[0] && discussion){
                            var latest_notificator = getLatestNotificator(notification.notificators);
                            notification.link = "/discussions/" + notification.notificators[0].sub_entity_id + "#post_" + notification.entity_id;
//                            notification.link += latest_notificator ? "#post_" + notification.entity_id : "";
                            notification.pic = discussion.image_field_preview
                                || discussion.image_field;
                            notification.name = discussion.title;
                        }

                        notification.part_one = "תגובה שהעלית בדיון " +
                            notification.name +
                            " " +
                            "זכתה ל-"+
                            " " +
                            num_of_tokens +
                            " " +
                             "הצבעות תמיכה על ידי"
                            + " "

                        if(user_obj && num_of_users_support == 1){
                            notification.part_tow = user_obj.first_name + " " + user_obj.last_name;
                            notification.extra_link = "/myuru/" + user_obj._id;
                        }else{
                            notification.part_tow =
                                num_of_users_support +
                                     " " +
                                    "משתמשים"
                        }
                    }
                    itr_cbk();

                    break;
                case "user_gave_my_post_bad_tokens":

                    var num_of_users_that_vote_my_post = 0;
                    var num_of_users_support = 0;
                    var num_of_users_against = 0;
                    var num_of_tokens = 0;

                    var support_users = [];
                    var against_users = [];

                    //first i count suppports/against, user whose balance is 0 dont count
                    _.each(notification.notificators, function(notificator){
                        var balance = notificator.ballance;
                        if(balance != 0){
                            num_of_users_that_vote_my_post++;
                            num_of_users_support += balance > 0 ? 1 : 0;
                            num_of_users_against += balance < 0 ? 1 : 0;
                            num_of_tokens += balance < 0 ? balance : 0;

                            if(balance > 0)
                                support_users.push(notificator.notificator_id);
                            else
                                against_users.push(notificator.notificator_id);
                        }
                    })

                    if(num_of_users_that_vote_my_post){
                        notification.html_version = true;

                        if(notification && notification.notificators[0] && discussion){
                            var latest_notificator = getLatestNotificator(notification.notificators);
                            notification.link = "/discussions/" + notification.notificators[0].sub_entity_id + "#post_" + notification.entity_id;
                            notification.pic = discussion.image_field_preview || discussion.image_field;
                            notification.name = discussion.title;
                        }

                        notification.part_one = "תגובה שהעלית בדיון " +
                            notification.name +
                            " " +
                            "זכתה ל-"+
                            " " +
                            num_of_tokens * -1 +
                            " " +
                            "הצבעות התנגדות על ידי "

                        if(user_obj && num_of_users_against == 1){
                            notification.part_tow = user_obj.first_name + " " + user_obj.last_name;
                            notification.extra_link = "/myuru/" + user_obj._id;
                        }else{
                            notification.part_tow =
                                num_of_users_against +
                                        " " +
                                    "משתמשים"
                        }
                    }
                    itr_cbk();
                    break;
                default:
                    itr_cbk({message: "there is no such notification type", code: 404});
            }
        }
    };
};

var populateNotifications = module.exports.populateNotifications = function(results, callback) {
    //formulate notifications
    var notificator_ids = _.chain(results.objects)
        .map(function (notification) {
            return notification.notificators.length ? notification.notificators[0].notificator_id : null;
        })
        .compact()
        .uniq()
        .value();

    var post_or_suggestion_notification_types = [
        "user_gave_my_post_tokens",
        "user_gave_my_suggestion_tokens"
    ];
    var discussion_notification_types = [
        "comment_on_discussion_you_are_part_of",
        "change_suggestion_on_discussion_you_are_part_of",
        "comment_on_discussion_you_created",
        "change_suggestion_on_discussion_you_created",
        "approved_change_suggestion_you_created",
        "approved_change_suggestion_you_graded",
        "been_quoted",
        "a_dicussion_created_with_info_item_that_you_like",
        "a_dicussion_created_with_info_item_that_you_created",
        "proxy_created_new_discussion",
        "proxy_graded_discussion"
    ];

    var discussion_ids = _.chain(results.objects)
        .map(function (notification) {
            return  _.indexOf(discussion_notification_types, notification.type) > -1
                ? notification.entity_id : null;
        })
        .compact()
        .uniq()
        .value();

    var discussion_notification_types_as_sub_entity = [
        "user_gave_my_post_tokens",
        "user_gave_my_suggestion_tokens",
        "proxy_created_change_suggestion",
        "proxy_graded_change_suggestion",
        "proxy_vote_to_post"
    ];

    var discussion_ids_as_sub_entity = _.chain(results.objects)
        .map(function (notification) {
            return  _.indexOf(discussion_notification_types_as_sub_entity, notification.type) > -1
                ? notification.notificators[0].sub_entity_id : null;
        })
        .compact()
        .uniq()
        .value();

    discussion_ids_as_sub_entity = _.chain(discussion_ids_as_sub_entity)
        .compact()
        .uniq()
        .value();

    discussion_ids = _.union(discussion_ids, discussion_ids_as_sub_entity);
    discussion_ids = _.chain(discussion_ids).map(function(id) { return id + ''; })
        .compact()
        .uniq()
        .value();

    var post_or_suggestion_ids = _.chain(results.objects)
        .map(function (notification) {
            return  _.indexOf(post_or_suggestion_notification_types, notification.type) > -1
                ? notification.entity_id : null;
        })
        .compact()
        .uniq()
        .value();

    var info_item_notification_types = [
        "approved_info_item_i_created"
//                    "approved_info_item_i_liked"
    ];

    var info_items_ids = _.chain(results.objects)
        .map(function (notification) {
            return  _.indexOf(info_item_notification_types, notification.type) > -1
                ? notification.entity_id : null;
        })
        .compact()
        .uniq()
        .value();

    async.parallel([
        function(cbk){
            if(notificator_ids.length)
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
            else
                cbk(null,{});
        },

        function(cbk){
            if(discussion_ids.length)
                models.Discussion.find()
                    .where('_id')
                    .in(discussion_ids)
                    .select(['id', 'title', 'image_field_preview', 'image_field', 'text_field_preview'])
                    .exec(function (err, discussions) {

                        var got_ids = _.pluck(discussions,'id');
                        var not_found_ids = _.without(discussion_ids,got_ids);
                        if(not_found_ids.length)
                            console.log(not_found_ids);
                        if(!err){
                            var discussions_hash = {};

                            _.each(discussions, function (discussion) {
                                discussions_hash[discussion.id] = discussion;
                            });
                        }
                        cbk(err, discussions_hash);
                    });
            else
                cbk(null,{});
        },

        function(cbk){
            if(info_items_ids.length)
                models.InformationItem.find({}, ['id', 'image_field_preview', 'image_field', 'title'])
                    .where('_id').in(info_items_ids).run(function (err, info_items) {

                        if(!err){
                            var info_items_hash = {};

                            _.each(info_items, function (info_item) {
                                info_items_hash[info_item.id] = info_item;
                            });
                        }
                        cbk(err, info_items_hash);
                    });
            else
                cbk(null,{});
        }
    ], function(err, args){
        async.forEach(results.objects, iterator(args[0], args[1], args[2]), function (err, obj) {
            callback(err, results);
        })
    })
};

function getLatestNotificator(notificators_arr){
   return _.max(notificators_arr, function(noti){ return noti.date; });
}

