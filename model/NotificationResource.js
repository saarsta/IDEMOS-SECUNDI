var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async');

var NotificationCategoryResource = module.exports = resources.MongooseResource.extend(
{
    init: function(){
        this._super(models.Notification);
        this.allowed_methods = ['get', 'put'];
        this.authentication = new common.SessionAuthentication();
        this.update_fields = {name: null};
        this.default_query = function (query) {
            return query.sort('creation_date', 'descending');
        };
        this.fields = {
            _id: null,
            user_id: null,
            notificators: null,
            message: null,
            link: null,
            pic: null
        }
    },

    get_objects: function (req, filters, sorts, limit, offset, callback) {
        var user_id = req.query.user_id;
        if(!user_id && req.user)
            user_id = req.user._id;

        if(user_id)
            filters['user_id'] = user_id;

        this._super(req, filters, sorts, limit, offset, function(err, results){

            //formulate notifications

            async.forEach(results.objects, iterator, function(err, obj){
                callback(err, results);
            })
        });
    }
});


var iterator = function(notification, itr_cbk){
{
    var message;
    var link;
    var pic;

    switch (notification.type){
        case "approved_info_item":
            notification.message =
                "פריט מידע שהצעת התקבל"
            ;
            notification.link = "/information_items/" + notification.entity_id;
            models.InformationItem.findById(notification.entity_id, function(err, info_item){
                if(!err)
                    notification.pic = info_item.image_field_preview;

                itr_cbk(err);
            });
            break;
        case "comment_on_discussion_you_are_part_of":
            var num_of_comments = notification.notificators.length;
            notification.link = "/discussions/" + notification.entity_id;

            if(num_of_comments > 1){
                message = num_of_comments + " " +
                    "אנשים הגיבו על דיון שאתה חלק ממנו"
                ;
                notification.message = message;
                itr_cbk();
            }else{
                models.User.findById(notification.notificator_id, function(err, user_obj){
                    if(!err){
                        notification.message = user_obj.first_name + " " + user.last_name + " " +
                            "הגיב על דיון שאתה חלק ממנו"
                        ;
                    }
                    itr_cbk(err)
                });
            }
            break;
        case "change_suggestion_on_discussion_you_are_part_of":
            var num_of_comments = notification.notificators.length;
            notification.link = "/discussions/" + notification.entity_id;

            if(num_of_comments > 1){
                message = num_of_comments + " " +
"אנשים הגיבו על הצעה לשינוי שלקחת בה חלק"
                ;
                itr_cbk()
            }else{
                models.User.findById(notification.notificator_id, function(err, user_obj){
                    if(!err){
                        notification.message = user_obj.first_name + " " + user.last_name + " " +
                      "הגיב על הצעה לשינוי שלקחת בה חלק"
                        ;
                    }
                    itr_cbk(err);
                });
            }
            break;
        case "comment_on_discussion_you_created" :
            var num_of_comments = notification.notificators.length;
            notification.link = "/discussions/" + notification.entity_id;

            if(num_of_comments > 1){
                notification.message = num_of_comments + " " +
                    "אנשים הגיבו על דיון שיצרת"
                ;
                itr_cbk(null, 1);
            }else{
                models.User.findById(notification.notificator_id, function(err, user_obj){
                    if(!err){
                        notification.message = user_obj.first_name + " " + user.last_name +
                            "הגיב על דיון שיצרת"
                        ;
                    }
                    itr_cbk(err);
                });
            }
            break;
        case "change_suggestion_on_discussion_you_created":
            var num_of_comments = notification.notificators.length;
            notification.link = "/discussions/" + notification.entity_id;

            if(num_of_comments > 1){
                notification.message = num_of_comments + " "
                 "אנשים הגיבו על הצעה לשינוי שיצרת"
                ;
                itr_cbk();
            }else{
                models.User.findById(notification.notificator_id, function(err, user_obj){
                    if(!err){
                        message = user_obj.first_name + " " + user.last_name + " " +
                            "הגיב על הצעה שלינוי שיצרת"
                        ;
                    }
                    itr_cbk(err);
                });
            }
            break;
        case "approved_change_suggestion_you_created":
            notification.message =
                "התקבלה הצעה לשינוי שהצעת"
            ;
            notification.link = "/discussions/" + notification.entity_id;
            models.Discussions.findById(notification.entity_id, function(err, disc){
                if(!err)
                    notification.pic = disc.image_field_preview;
                itr_cbk(err);
            });
            break;
        case "approved_change_suggestion_you_graded":
            notification.message =
                "התקבלה הצעה לשינוי שדירגת"
            ;
            notification.link = "/discussions/" + notification.entity_id;
            models.Discussions.findById(notification.entity_id, function(err, disc){
                if(!err)
                    notification.pic = disc.image_field_preview;
                itr_cbk(err);
            });
            break;
        case "your_post_been_quoted":

            notification.link = "/discussions/" + notification.entity_id + '#post_' + notification.notificators.sub_entity_id;
            models.User.findById(notification.notificator_id, function(err, user_obj){
                if(!err)
                    notification.message = user_obj.first_name + " " + user_obj.last_name + " " +
                    "ציטט אותך"
                    ;

                itr_cbk(err)
            });
            break;
        default:
            itr_cbk();
        }
    }
}
