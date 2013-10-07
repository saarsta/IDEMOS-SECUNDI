var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async'),
    _  = require('underscore');

var NotificationCategoryResource = module.exports = resources.MongooseResource.extend(
    {
        init:function () {
            this._super(models.Notification);
            this.allowed_methods = ['get'];
            this.authentication = new common.SessionAuthentication();
            this.update_fields = {name:null};
            this.default_query = function (query) {
                return query.sort({'update_date': 'descending'});
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
                name: null,
                update_date:null,
                visited: null,

                pic:null,
                //text only
                part_one: null,
                //text with link
                part_two: null,
                link_two:null,
                //text only
                part_three: null,
                //text with link
                part_four: null,
                link_four: null,
                //text only
                part_five: null,

                link_to_first_comment_user_didnt_see: null,
                discussion_link: null,

                //extra text is the text displayed before the button
                extra_text: null,
                main_link: null,

                //for user part
                user_link: null,
                user: null,

                //for "join" button
                is_going: null,
                check_going: null,

                //for the share part
                img_src: null,
                title: null,
                text_preview: null,

                //for mail_settings part
                mail_settings_link: null

            }
        },

        get_objects:function (req, filters, sorts, limit, offset, callback) {
            var user_id = req.query.user_id;
            if (!user_id && req.user)
                user_id = req.user.id;

            if (user_id)
                filters['user_id'] = user_id;


            this._super(req, filters, sorts, limit, offset, function (err, results) {

                if(err)
                    callback(err);
                else
                    populateNotifications(results, user_id, function(err, results){
                        callback(err, results);
                    });
            });
        }
    });


var iterator = function (users_hash, discussions_hash, posts_hash, action_posts_hash, info_items_hash, actions_hash, cycles_hash, updates_hash, resources_hash, user_id) {
    return function (notification, itr_cbk) {
        {
            var user_obj = notification.notificators.length ?
                users_hash[notification.notificators[0].notificator_id] : null;
            var discussion = discussions_hash[notification.entity_id + ''] || discussions_hash[notification.notificators[0].sub_entity_id + ''];
            var info_item = info_items_hash[notification.entity_id + ''] || info_items_hash[notification.notificators[0].sub_entity_id + ''];
            var action_post = action_posts_hash[notification.entity_id + ''];
            var post = posts_hash[notification.entity_id + ''] || posts_hash[notification.notificators[0].sub_entity_id + ''];
            var post_id = post ? post._id : "";
            var action = actions_hash[notification.entity_id + ''] || actions_hash[notification.notificators[0].sub_entity_id + ''];
            var cycle = cycles_hash[notification.entity_id + ''] || cycles_hash[notification.notificators[0].sub_entity_id + ''];
            var update = updates_hash[notification.entity_id + ''];
            var resource = resources_hash[notification.notificators[0].sub_entity_id + ''];
            var going_users;
            if(action){
                going_users = _.map(action.going_users, function(user){return user.user_id + "";});
            }

            switch (notification.type) {
                case "approved_info_item_i_created":
                    notification.part_one = "פריט מידע שיצרת התקבל למערכת: ";
                    if(info_item){
                        notification.main_link = "/information_items/" + info_item._id;
                        notification.pic = info_item.image_field_preview || info_item.image_field;
                        notification.part_two = info_item.title;
                        notification.link_two = "/information_items/" + info_item._id;
                    }
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
                        notification.main_link = "/discussions/" + discussion._id + "" + "#post_" +  post_id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.part_two = discussion.title;
                        notification.link_two = "/discussions/" + discussion._id;

                        //for fb share
                        notification.img_src = notification.pic;
                        notification.title = discussion.title;
                        notification.mail_settings_link = "/mail_settings/discussion/" + discussion.id + '?force_login=1';
                        notification.text_preview = discussion.text_field_preview;
                    }

                    if (num_of_comments > 1) {
"חדשות בדיון שהשתתפת בו - "                        ;
                        notification.user = num_of_comments + " תגובות ";
                        notification.part_one = "חדשות בדיון שהשתתפת בו - ";
                    } else {
                        if(user_obj){
                            notification.user = user_obj.first_name + " " + user_obj.last_name;
                            notification.user_link = "/myuru/" + user_obj._id + '';
                        }
                        notification.part_one = " הגיב על דיון שהשתתפת בו - ";
                    }
                    itr_cbk();
                    break;

                case "change_suggestion_on_discussion_you_are_part_of":
                    var num_of_comments = notification.notificators.length;
                    if(discussion){
                        notification.main_link = "/discussions/" + discussion._id + "#post_" +  post_id;

                        notification.part_two = discussion.title;
                        notification.link_two = "/discussions/" + discussion._id;

                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.img_src = notification.pic;
                        notification.title = discussion.title;
                        notification.text_preview = discussion.text_field_preview;
                        notification.mail_settings_link = "/mail_settings/discussion/" + discussion.id + '?force_login=1';
                    }

                    if (num_of_comments > 1) {
                        notification.user = num_of_comments + " " + "אנשים";
                        notification.part_one = "העלו הצעה לשינוי בדיון שלקחת בו חלק - ";
                    } else {
                        if(user_obj){
                            notification.user = user_obj.first_name + " " + user_obj.last_name;
                            notification.user_link = "/myuru/"  + user_obj._id + '';
                        }
                        notification.part_one = "העלה הצעה לשינוי בדיון שלקחת בו חלק - ";
                    }
                    itr_cbk();
                    break;

                case "comment_on_discussion_you_created" :
                    var num_of_comments = notification.notificators.length;
                    if(discussion){
                        notification.main_link = "/discussions/" + discussion._id + "#post" + post_id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.part_two = discussion.title;
                        notification.link_two = "/discussions/" + discussion._id + "";

                        notification.img_src = notification.pic;
                        notification.title = discussion.title;
                        notification.text_preview = discussion.text_field_preview;
                        notification.mail_settings_link = "/mail_settings/discussion/" + discussion.id + '?force_login=1';
                    }

                    if (num_of_comments > 1) {
                        notification.user = num_of_comments + " " + "אנשים";
                        notification.part_one = " הגיבו על דיון שיצרת - ";
                        itr_cbk(null, 1);
                    } else {
                        if(user_obj){
                            notification.user = user_obj.first_name + " " + user_obj.last_name;
                            notification.user_link = "/myuru/" + user_obj._id + "";
                            notification.pic = user_obj.avatar_url();
                        }
                        notification.part_one = " הגיב על דיון שיצרת - ";
                        itr_cbk();
                    }
                    break;
                case "change_suggestion_on_discussion_you_created":
                    var num_of_comments = notification.notificators.length;
                    if(discussion){
                        notification.main_link = "/discussions/" + discussion._id + "";
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.part_two = discussion.title;
                        notification.link_two = "/discussions/" + discussion._id + "";

                        notification.img_src = notification.pic;
                        notification.title = discussion.title;
                        notification.text_preview = notification.text_field_preview;
                        notification.mail_settings_link = "/mail_settings/discussion/" + discussion.id + '?force_login=1';
                    }
                    if (num_of_comments > 1) {
                        notification.user = num_of_comments + " " + "אנשים";
                        notification.part_one = "הגיבו על הצעה לשינוי שהעלית בדיון - ";
                    } else {
                        if(user_obj){
                            notification.user = user_obj.first_name + " " + user_obj.last_name;
                            notification.user_link = "/myuru/" + user_obj._id + "";
                        }
                        notification.part_one = "הגיב על הצעה לשינוי שהעלת בדיון - ";
                    }
                    itr_cbk();
                    break;

                case "approved_change_suggestion_you_created":
                    notification.part_one = "התקבלה הצעה לשינוי שהעלת בדיון - ";
                    if(discussion){
                        notification.part_two = discussion.title;
                        notification.link_two = "/discussions/" + discussion._id;
                        notification.main_link = "/discussions/" + discussion._id + '#post_' + post_id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;

                        notification.img_src = notification.pic;
                        notification.title = discussion.title;
                        notification.text_preview = discussion.text_field_preview;

                        /*//SAAR: is this still used?
                        notification.old_text= discussion.vision_text_history == undefined?'': discussion.vision_text_history[discussion.vision_text_history.length - 1];
                        notification.new_text= discussion.text_field;*/

                        notification.old_text = discussion.replaced_text_history == undefined?'': discussion.replaced_text_history[discussion.replaced_text_history.length - 1].old_text;
                        notification.new_text = discussion.replaced_text_history == undefined?'': discussion.replaced_text_history[discussion.replaced_text_history.length - 1].new_text;
                        notification.mail_settings_link = "/mail_settings/discussion/" + discussion.id + '?force_login=1';
                    }
                    itr_cbk();
                    break;

                case "approved_change_suggestion_on_discussion_you_are_part_of":
                    notification.part_one = "התקבלה הצעה לשינוי שדירגת בדיון - ";
                    if(discussion){
                        notification.main_link = "/discussions/" + discussion._id + "#post_" +  post_id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.part_two = discussion.title;
                        notification.link_two = "/discussions/" + discussion._id;

                        notification.img_src = notification.pic;
                        notification.title = discussion.title;
                        notification.text_preview = discussion.text_field_preview;

                       /* //SAAR: is this still used?
                        notification.old_text= discussion.vision_text_history==undefined?'': discussion.vision_text_history[discussion.vision_text_history.length - 1];
                        notification.new_text= discussion.text_field;*/

                        notification.old_text = discussion.replaced_text_history == undefined?'': discussion.replaced_text_history[discussion.replaced_text_history.length - 1].old_text;
                        notification.new_text = discussion.replaced_text_history == undefined?'': discussion.replaced_text_history[discussion.replaced_text_history.length - 1].new_text;
                        notification.mail_settings_link = "/mail_settings/discussion/" + discussion.id + '?force_login=1';
                    }
                    itr_cbk();
                    break;

                case "been_quoted":
                    if(discussion){
                        notification.main_link = "/discussions/" + discussion._id + '#post_' + post_id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.part_two = discussion.title;
                        notification.link_two = "/discussions/" + discussion._id;

                        notification.img_src = notification.pic;
                        notification.title = 'תגובה מתוך דיון על החזון '
                            +
                            discussion.title;
                        notification.text_preview = discussion.text_field_preview;

                        //SAAR: is this still used?
                        notification.quote_link  = "/discussions/" + discussion._id + '#post_' + post_id;
                        notification.discussion_link = "/discussions/" + discussion._id;
                        notification.mail_settings_link = "/mail_settings/discussion/" + discussion.id + '?force_login=1';
                    }
                    if(user_obj){
                         notification.user = user_obj.first_name + " " + user_obj.last_name;
                         notification.user_link = user_obj._id;
                    }
                    notification.part_one = "ציטט אותך בדיון - ";

                    if(post){
                        //SAAR: is this still used?
                        notification.user_quote = (post.text).replace(/\[(?:quote|ציטוט)=(?:"|&quot;)([^"&]*)(?:"|&quot;)\s*\]\n?((?:.|\n)*)?\n?\[\/(?:quote|ציטוט)\]\n?/g, "");
                        notification.user_quote = notification.user_quote.replace(/(<([^>]+?)>)/ig,"");
                    }
                    itr_cbk();
                    break;
                case "a_dicussion_created_with_info_item_that_you_like":
                    notification.part_one = "פריט מידע שעשית לו לייק תוייג בדיון - ";
                    if(discussion){
                        notification.main_link = "/discussions/" + discussion._id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.part_two = discussion.title;
                        notification.link_two = "/discussions/" + discussion._id;

                        notification.img_src = notification.pic;
                        notification.title = discussion.title;
                        notification.text_preview = discussion.text_field_preview;
                    }
                    itr_cbk();
                    break;
                case "new_discussion":
                    if(discussion){
                        notification.part_one = discussion.subject_name;
                        notification.main_link = "/discussions/" + discussion._id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.part_two = discussion.title;
                        notification.link_two = "/discussions/" + discussion._id;

                        notification.img_src = notification.pic;
                        notification.title = discussion.title;
                        notification.text_preview = discussion.text_field_preview;
                    }
                    if(user_obj){
                        notification.user = user_obj.first_name + " " + user_obj.last_name;
                    }
                    itr_cbk();
                    break;

                case "user_brings_resource_to_action_you_created":
                    if(user_obj){
                        notification.user = user_obj.first_name + " " + user_obj.last_name;
                        notification.user_link = "/myuru/" + user_obj._id + '';
                    }
                    if(resource){
                        notification.part_one = " התחייב/ה להביא " + resource.name + " לקידום פעולה ";
                    }
                    if(action){
                        notification.pic = action.image_field_preview || action.image_field;
                        notification.img_src = notification.pic;
                        notification.link_two = "/actions/" + action._id;
                        notification.part_two = action.title;
                        notification.part_three = " במסגרת הקמפיין ";
                        notification.link_four = "/cycles/" + action.cycle_id[0].cycle;
                        notification.main_link = "/actions/" + action._id;
                        models.Cycle.findById(action.cycle_id[0].cycle, {title : 1}, function(err, cycle){
                            notification.part_four = cycle.title;
                            itr_cbk();
                        });
                    }
                    else{
                        itr_cbk();
                    }
                    break;

                case "post_added_to_action_you_created":
                    var num_of_joined = notification.notificators.length;
                    if(num_of_joined > 1){
                        notification.part_one = "נוספו "
                            + num_of_joined + " תגובות חדשות לפעולה "
                    } else {
                        if(user_obj){
                            notification.part_one = " הוסיף תגובה חדשה לפעולה ";
                            notification.user = user_obj.first_name + " " + user_obj.last_name;
                            notification.user_link = "/myuru/" + user_obj._id + "";
                        }

                    }
                    notification.part_three = " שיצרת בקמפיין ";

                    if(action){
                        notification.link_two = "/actions/" + action._id;
                        notification.part_two = action.title;
                        notification.pic = action.image_field_preview || action.image_field;
                        notification.img_src = notification.pic;
                        notification.main_link = "/actions/" + action._id + "#post_" + action_post.id;
                        notification.link_four = "/cycles/" + action.cycle_id[0].cycle;
                        models.Cycle.findById(action.cycle_id[0].cycle, {title : 1}, function(err, cycle){
                            notification.part_four = cycle.title;
                            itr_cbk();
                        });
                    } else {
                        itr_cbk();
                    }
                    break;

                case "post_added_to_action_you_joined":
                    var num_of_joined = notification.notificators.length;
                    if(num_of_joined > 1){
                        notification.part_one = "נוספו "
                        + num_of_joined + " תגובות חדשות לפעולה "
                    } else {
                        if(user_obj){
                            notification.part_one = " הוסיף תגובה חדשה לפעולה ";
                            notification.user = user_obj.first_name + " " + user_obj.last_name;
                            notification.user_link = "/myuru/" + user_obj._id + "";
                        }
                    }
                    notification.part_three = " שבקמפיין ";

                    if(action){
                        notification.link_two = "/actions/" + action._id;
                        notification.part_two = action.title;
                        notification.pic = action.image_field_preview || action.image_field;
                        notification.img_src = notification.pic;
                        notification.main_link = "/actions/" + action._id + "#post" + action_post.id;
                        notification.link_four = "/cycles/" + action.cycle_id[0].cycle;
                        models.Cycle.findById(action.cycle_id[0].cycle, {title : 1}, function(err, cycle){
                            notification.part_four = cycle.title;
                            itr_cbk();
                        });
                    } else {
                        itr_cbk();
                    }
                    break;

                case "action_suggested_in_cycle_you_are_part_of":
                    notification.part_one = "לקמפיין ";
                    notification.part_three = " נוסף רעיון לפעולה: "
                    if(cycle){
                        notification.link_two = "/cycles/" + cycle.id;
                        notification.part_two = cycle.title;
                        notification.pic = cycle.image_field_preview || cycle.image_field;
                        notification.img_src = notification.pic;
                    }
                    if(action){
                        notification.main_link = "/actions/" + action._id;
                        notification.link_four = "/actions/" + action._id;
                        notification.part_four = action.title;
                        notification.extra_text = "לחצו כאן כדי לגרום לזה לקרות!";
                        notification.check_going = true;
                        if(going_users){
                            if(_.contains(going_users, user_id + "")){
                                notification.is_going = true;
                            } else {
                                notification.is_going = false;
                            }
                        }
                    }
                    itr_cbk();
                    break;

                case "action_you_created_was_approved":
                    notification.part_one = "הרעיון שהעלית לפעולה בקמפיין ";
                    notification.part_three = " התקבל ויוצא לדרך!";
                    if(cycle){
                        notification.link_two = "/cycles/" + cycle.id;
                        notification.part_two = cycle.title;
                    }
                    if(action){
                        notification.main_link = "/actions/" + action._id;
                        notification.pic = action.image_field_preview || action.image_field;
                        notification.img_src = notification.pic;
                        notification.link = "/actions/" + action._id;
                    }
                    itr_cbk();
                    break;

                case "user_joined_action_you_created":
                    var num_of_joined = notification.notificators.length;
                    if(num_of_joined > 1) {
                        notification.user = num_of_joined + " חברי עורו";
                        notification.part_one = " הביעו תמיכה ברעיון לפעולה שהעלית בקמפיין ";
                    } else {
                        if(user_obj)
                        notification.user = user_obj.first_name + " " + user_obj.last_name;
                        notification.part_one = " הביע תמיכה ברעיון לפעולה שהעלית בקמפיין "
                        notification.user_link = "/myuru/" + user_obj._id + '';
                    }
                    if(action){
                        notification.main_link = "/actions/" + action._id;
                        notification.pic = action.image_field_preview || action.image_field;
                        notification.img_src = notification.pic;
                        notification.link = "/actions/" + action._id;
                    }
                    if(cycle){
                        notification.link_two = "/cycles/" + cycle.id;
                        notification.part_two = cycle.title;
                    }
                    itr_cbk();
                    break;

                case "action_you_are_participating_in_was_approved":
                    notification.part_one = "הרעיון לפעולה שהשתתפת בו בקמפיין ";
                    notification.part_three = " התקבל ויוצא לדרך!";
                    if(cycle){
                        notification.link_two = "/cycles/" + cycle.id;
                        notification.part_two = cycle.title;
                    }
                    if(action){
                        notification.main_link = "/actions/" + action._id;
                        notification.pic = action.image_field_preview || action.image_field;
                        notification.img_src = notification.pic;
                        notification.link = "/actions/" + action._id;
                    }
                    itr_cbk();
                    break;
                case "action_added_in_cycle_you_are_part_of":
                    notification.part_one = "לקמפיין ";
                    notification.part_three = " שבהשתתפותך נוספה פעולה חדשה - "
                    if(cycle){
                        notification.link_two = "/cycles/" + cycle.id;
                        notification.part_two = cycle.title;
                        notification.pic = cycle.image_field_preview || cycle.image_field;
                        notification.img_src = notification.pic;
                    }
                    if(action){
                        notification.main_link = "/actions/" + action._id;
                        notification.link_four = "/actions/" + action._id;
                        notification.part_four = action.title;
                        notification.check_going = true;
                        if(going_users){
                            if(_.contains(going_users, user_id + "")){
                                notification.is_going = true;
                            } else {
                                notification.is_going = false;
                            }
                        }
                    }
                    itr_cbk();
                    break;
                case "update_created_in_cycle_you_are_part_of":
                    notification.html_version = true;
                    notification.part_one = "פריט מידע חדש נוסף לקמפיין ";
                    notification.part_three = " שבהשתתפותך - ";
                    if(cycle){
                        notification.link_two = "/cycles/" + cycle.id;
                        notification.part_two = cycle.title;
                        notification.pic = cycle.image_field_preview || cycle.image_field;
                        notification.img_src = notification.pic;
                    }
                    if(update){
                        notification.main_link = "/updates/" + update.id;
                        notification.link_four = "/updates/" + update.id;
                        notification.part_four = update.title;
                    }
                    itr_cbk();
                    break;
                case "user_gave_my_suggestion_tokens":
                    var num_of_users_that_vote_my_sugg = notification.notificators.length;

                        var latest_notificator = getLatestNotificator(notification.notificators);
                    if(discussion){
                        notification.main_link = "/discussions/" + discussion._id + "#post_" + post_id;
                        notification.part_two = discussion.title;
                        notification.link_two = "/discussions/" + discussion._id;
                    }

                    if(user_obj){
                        notification.pic = user_obj.avatar_url();
                        notification.user = user_obj.first_name + " " + user_obj.last_name;
                        notification.user_link = "/myuru/" + user_obj._id;
                    }
                    if(num_of_users_that_vote_my_sugg == 1){
                        var support_or_not = "התנגד ל";
                        if(notification.notificators[0].votes_for > 0 )
                            support_or_not = "תמך ב";

                        notification.part_one =
                            support_or_not
                        + "הצעה לשינוי שהעלת בדיון - "
                        ;
                    }else{
                        var token_sum = _.reduce(notification.notificators, function(sum, notificator){return sum + Number(notificator.ballance)}, 0);

                        var supprorts_sum = _.reduce(notification.notificators, function(sum, notificator){return sum + Number(notificator.votes_for)}, 0);
                        var against_sum = _.reduce(notification.notificators, function(sum, notificator){return sum + Number(notificator.votes_against)}, 0);

                        if(supprorts_sum && against_sum){
                            notification.user = supprorts_sum +
                                " " +
                                "חברי עורו"
                            ;
                            notification.part_one =
                                "תמכו בהצעה שהעלית (ו"
                                    + against_sum
                                    + " "
                                    + "התנגדו לה)"
                                + " "
 + "בדיון - "
                            ;
                        }else if (supprorts_sum){
                            notification.user = supprorts_sum +
                                " " +
                                "חברי עורו"
                            ;
                            notification.part_one = "תמכו בהצעה שהעלית בדיון - ";
                        }else if (against_sum){
                            notification.user = against_sum +
                                " " +
                                "חברי עורו"
                            ;
                            notification.part_one = "התנגדו להצעה שהעלית בדיון - ";
                        }
                    }
                    itr_cbk();
                    break;

                case "proxy_created_new_discussion":
                    notification.part_one = "" +
                        "נפתח דיון חדש על ידי "
                    if(discussion){
                        notification.main_link = "/discussions/" + discussion._id;
                        notification.pic = discussion.image_field_preview || discussion.image_field;
                        notification.name = discussion.title;
                        notification.img_src = notification.pic;
                    }
                    if(user_obj){
                        notification.part_two = user_obj.first_name + " " + user_obj.last_name;
                        notification.link_two = "/myuru/" + user_obj._id;
                    }

                    notification.part_three =
           ", המייצג/ת אותך בעורו"
                    itr_cbk();
                    break;
                case "proxy_created_change_suggestion":
                    if(discussion){
                        notification.main_link = "/discussions/" + discussion._id + "#post_" + post_id;
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
                        notification.part_two = user_obj.first_name + " " + user_obj.last_name;
                        notification.link_two = "/myuru/" + user_obj._id;
                    }

                    notification.part_three =
           ", המייצג/ת אותך בעורו";

                    itr_cbk();
                    break;
                case "proxy_graded_change_suggestion":
                    if(discussion){
                        notification.main_link = "/discussions/" + discussion._id + "#post_" + post_id;
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
                        notification.part_two = user_obj.first_name + " " + user_obj.last_name;
                        notification.link_two = "/myuru/" + user_obj._id;
                    }

                    notification.part_three =
           ", המייצג/ת אותך בעורו";
                    itr_cbk();
                    break;

                case "proxy_graded_discussion":
                    if(discussion){
                        notification.main_link = "/discussions/" + discussion._id + "";
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
                        notification.part_two = user_obj.first_name + " " + user_obj.last_name;
                        notification.link_two = "/myuru/" + user_obj._id;
                    }
                    notification.part_three =
           ", המייצג/ת אותך בעורו";
                    itr_cbk();
                    break;

                case "proxy_vote_to_post":
                    var balance = notification.notificators[0].ballance;
                    if(balance != 0){
                        var is_agree = balance > 0 ? "תמך בתגובה בדיון " : "התנגד לתגובה בדיון ";

                            notification.main_link = "/discussions/" + discussion._id + "#post_" + post_id;
                            notification.pic = discussion.image_field_preview || discussion.image_field;
                            notification.name = discussion.title;
                            notification.img_src = notification.pic;

                        if(user_obj){
                            notification.part_two = user_obj.first_name + " " + user_obj.last_name;
                            notification.link_two = "/myuru/" + user_obj._id;
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
                        if(discussion){
                            var latest_notificator = getLatestNotificator(notification.notificators);
                            notification.main_link = "/discussions/" + discussion._id + "#post_" + post_id;
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
                            notification.part_two = user_obj.first_name + " " + user_obj.last_name;
                            notification.link_two = "/myuru/" + user_obj._id;
                        }else{
                            notification.part_two =
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
                        if(notification && discussion){
                            var latest_notificator = getLatestNotificator(notification.notificators);
                            notification.main_link = "/discussions/" + discussion._id + "#post_" + post_id;
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
                            notification.part_two = user_obj.first_name + " " + user_obj.last_name;
                            notification.link_two = "/myuru/" + user_obj._id;
                        }else{
                            notification.part_two =
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

var populateNotifications = module.exports.populateNotifications = function(results, user_id, callback) {
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

    var post_notification_types = [
        "been_quoted",
        "proxy_vote_to_post",
        "comment_on_discussion_you_are_part_of",
        "comment_on_discussion_you_created",
        "change_suggestion_on_discussion_you_are_part_of",
        "change_suggestion_on_discussion_you_created",
        "approved_change_suggestion_you_created",
        "approved_change_suggestion_on_discussion_you_are_part_of",
    ];

    var action_post_notification_types = [
        "post_added_to_action_you_created",
        "post_added_to_action_you_joined"
    ];

    var cycle_notification_types_as_sub_entity = [
        "action_suggested_in_cycle_you_are_part_of",
        "action_added_in_cycle_you_are_part_of",
        "update_created_in_cycle_you_are_part_of",
        "action_you_created_was_approved",
        "action_you_are_participating_in_was_approved",
        "user_joined_action_you_created"
    ];

    var cycle_ids = _.chain(results.objects)
        .map(function (notification) {
            return  _.indexOf(cycle_notification_types_as_sub_entity, notification.type) > -1
                ? notification.notificators[0].sub_entity_id : null;
        })
        .compact()
        .uniq()
        .value();

    var action_notification_type = [
        "action_suggested_in_cycle_you_are_part_of",
        "action_added_in_cycle_you_are_part_of",
        "action_you_created_was_approved",
        "action_you_are_participating_in_was_approved",
        "user_joined_action_you_created",
        "user_brings_resource_to_action_you_created"

    ];

    var action_notification_type_as_sub_entity = [
        "post_added_to_action_you_joined",
        "post_added_to_action_you_created"
    ];
    var action_ids = _.chain(results.objects)
        .map(function (notification) {
            return  _.indexOf(action_notification_type, notification.type) > -1
                ? notification.entity_id : null;
        })
        .compact()
        .uniq()
        .value();

    var action_ids_as_sub_entity = _.chain(results.objects)
        .map(function (notification) {
            return  _.indexOf(action_notification_type_as_sub_entity, notification.type) > -1
                ? notification.notificators[0].sub_entity_id : null;
        })
        .compact()
        .uniq()
        .value();

    var action_ids = _.union(action_ids, action_ids_as_sub_entity);

    var update_notification_type = [
        "update_created_in_cycle_you_are_part_of"
    ];

    var resource_notification_type = [
        "user_brings_resource_to_action_you_created"
    ];

    var resource_ids = _.chain(results.objects)
        .map(function (notification) {
            return  _.indexOf(resource_notification_type, notification.type) > -1
                ? notification.notificators[0].sub_entity_id : null;
        })
        .compact()
        .uniq()
        .value();

    var update_ids = _.chain(results.objects)
        .map(function (notification) {
            return  _.indexOf(update_notification_type, notification.type) > -1
                ? notification.entity_id : null;
        })
        .compact()
        .uniq()
        .value();

    var discussion_notification_types = [
        "new_discussion",
        "been_quoted",
        "a_dicussion_created_with_info_item_that_you_like",
        "a_dicussion_created_with_info_item_that_you_created",
        "proxy_created_new_discussion",
        "proxy_graded_discussion",
       /* "comment_on_discussion_you_are_part_of",
        "comment_on_discussion_you_created"*/
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
        "proxy_vote_to_post",
        "comment_on_discussion_you_are_part_of",
        "comment_on_discussion_you_created",
        "change_suggestion_on_discussion_you_are_part_of",
        "change_suggestion_on_discussion_you_created",
        "approved_change_suggestion_you_created",
        "approved_change_suggestion_on_discussion_you_are_part_of"
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

    var post_ids = _.chain(results.objects)
        .map(function (notification) {
            return  _.indexOf(post_notification_types, notification.type) > -1
                ? notification.entity_id : null;
        })
        .compact()
        .uniq()
        .value();

    var action_post_ids = _.chain(results.objects)
        .map(function (notification) {
            return  _.indexOf(action_post_notification_types, notification.type) > -1
                ? notification.entity_id + "" : null;
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
                models.User.find({}, {
                        'id':1,
                        'first_name':1,
                        'last_name':1,
                        'facebook_id':1,
                        'avatar':1})
                    .where('_id').in(notificator_ids)
                    .exec(function (err, users) {
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
                    .select({
                    'id':1,
                    'title':1,
                        'image_field_preview':1, 'image_field':1, 'text_field_preview':1,'vision_text_history':1,'text_field':1, 'subject_name':1})
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
            if(post_ids.length)
                models.PostOrSuggestion.find({},{'id':1, 'text':1})
                    .where('_id').in(post_ids)
                    .exec(function (err, posts_items) {

                        if(!err){
                            var post_items_hash = {};

                            _.each(posts_items, function (post_item) {
                                post_items_hash[post_item.id] = post_item;
                            });
                        }
                        cbk(err, post_items_hash);
                    });
            else
                cbk(null,{});
        },

        function(cbk){
            if(action_post_ids.length)
                models.PostAction.find({},{'id':1, 'text':1})
                    .where('_id').in(action_post_ids)
                    .exec(function (err, posts_items) {

                        if(!err){
                            var action_post_items_hash = {};

                            _.each(posts_items, function (post_item) {
                                action_post_items_hash[post_item.id] = post_item;
                            });
                        }
                        cbk(err, action_post_items_hash);
                    });
            else
                cbk(null,{});
        },

        function(cbk){
            if(info_items_ids.length)
                models.InformationItem.find({},
                    {'id':1,
                        'image_field_preview':1,
                        'image_field':1,
                        'title':1
                    })
                    .where('_id').in(info_items_ids)
                    .exec(function (err, info_items) {

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
        },
        function(cbk){
            if(action_ids.length){
                models.Action.find()
                    .where('_id').in(action_ids)
                    .select({'_id': 1, 'title': 1, 'image_field': 1, 'image_field_preview': 1, 'going_users': 1, 'cycle_id': 1})
                    .exec(function(err, actions){
                        if(!err){
                            var actions_hash = {};

                            _.each(actions, function(action){
                                actions_hash[action._id] = action;
                            });
                        }
                        cbk(err, actions_hash);
                    });
            } else
                cbk(null,{});
        },
        function(cbk){
            if(cycle_ids.length){
                models.Cycle.find()
                    .where('_id').in(cycle_ids)
                    .select({'_id': 1, 'title': 1, 'image_field': 1, 'image_field_preview': 1})
                    .exec(function(err, cycles){
                        if(!err){
                            var cycles_hash = {};

                            _.each(cycles, function(cycle){
                                cycles_hash[cycle._id] = cycle;
                            });
                        }
                        cbk(err, cycles_hash);
                    });
            }else
                cbk(null,{});
        },
        function(cbk){
            if(update_ids.length){
                models.Update.find()
                    .where('_id').in(update_ids)
                    .select({'_id': 1, 'title': 1, 'image_field': 1})
                    .exec(function(err, updates){
                        if(!err){
                            var updates_hash = {};

                            _.each(updates, function(update){
                                updates_hash[update._id] = update;
                            });
                        }
                        cbk(err, updates_hash);
                    })
            }else
                cbk(null,{});
        },
        function(cbk){
            if(resource_ids.length){
                models.ActionResource.find()
                    .where('_id').in(resource_ids)
                    .select({'_id': 1, 'name': 1})
                    .exec(function(err, resources){
                        if(!err){
                            var resources_hash = {};

                            _.each(resources, function(resource){
                                resources_hash[resource._id] = resource;
                            });
                        }
                        cbk(err, resources_hash);
                    })
            }else
                cbk(null,{});
        }
    ], function(err, args){
        async.forEach(results.objects, iterator(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], user_id), function (err, obj) {
            callback(err, results);
        })
    })
};

function getLatestNotificator(notificators_arr){
   return _.max(notificators_arr, function(noti){ return noti.date; });
}

