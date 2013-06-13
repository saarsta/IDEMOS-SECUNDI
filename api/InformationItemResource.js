/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 15/02/12
 * Time: 17:15
 * To change this template use File | Settings | File Templates.
 */

var models = require('../models'),
    async = require('async'),
    common = require('./common'),
    notifications = require('./notifications'),
    mail = require('../lib/mail'),
    NUM_OF_TAG_SUGG_BEFORE_APPROVAL = 1,
    SUGGEST_TAG_PRICE = 1;

var InformationItemResource = module.exports = common.GamificationMongooseResource.extend(
{
    init:function () {
        this._super(models.InformationItem, null, null);
        this.authentication = new common.SessionAuthentication();
        this.allowed_methods = ['get', 'post', 'put'];
//        this.authentication = new common.SessionAuthentication();
        this.filtering = {
            tags:null, subject_id:null, title:null, text_field:null, text_field_preview:null, users:null, is_hot_info_item:null, discussions:null};
        this.default_query = function (query) {
            return query.where('is_visible', true).where('status','approved').sort({'creation_date':'descending'}).populate('subject_id');
        },
        this.fields = {
            _id: null,
            title: null,
            tooltip_or_title:null,
            subject_id: {
                _id: null,
                name: null
            },
            category: null,
            text_field: null,
            text_field_preview: null,
            image_field:null,
            image_field_preview:null,
            created_by:{
                first_name:null,
                last_name:null
            },
            discussions: {
                _id: null,
                title: null
            },
            discussion_counter:null,
            cycles: {
                _id: null,
                title: null
            },
            actions: null,
            tags: null,
            like_counter: null,
            view_counter: null
        };
    },

    run_query: function(req,query,callback)
    {
        if(query._conditions.subject_id){
            query.populate('discussions')/*.populate('cycles').populate('actions')*/;
        }

        this._super(req, query, callback);
    },

    add_user_likes:function(user_id,object,callback){
        models.Like.count({user_id: user_id, info_item_id: object._id}, function(err, count){
            if(count)
                object.user_likes = true;
            callback(err, object)
        });
    },

    get_object:function (req, id, callback) {
        var self = this;
        this._super(req, id, function(err, object){
           object.user_likes = false;
           if(req.user){
               self.add_user_likes(req.user._id,object,callback);
           }else{
              callback(err, object)
           }
        });

    },

    create_obj: function(req, fields, callback){
        var user_id = req.session.user_id;
        var self = this;
        var info_item_object = new self.model();
        var mail_to = 'aharon@uru.org.il';
        var mail_subject = 'new information item';
        var mail_body =
            'YO! a new information item is waiting for you.. the title is: ' + '<a href="http://uru-admin.herokuapp.com/admin/model/InformationItem/document/' + info_item_object.id + '">' + fields.title + '</a>';


        fields.created_by = {creator_id:user_id, did_user_created_this_item: true};
        fields.status = "waiting";

        for(var field in fields){
            info_item_object.set(field,fields[field]);
        }

        async.waterfall([
            function(cbk){
                self.authorization.edit_object(req, info_item_object, cbk);
            },

            function(info_obj, cbk){
                info_obj.save(function(err, number){
                  cbk(err, number);
                });
            },

            // send mail to aharon about the news
            function(obj, cbk){
                mail.sendMail(mail_to, mail_body, mail_subject, function(err, result){
                    if (err) console.error(err);
                });

                cbk(null, 0);
            }
        ], callback);
    },

    //when user suggest tag for info_item
    update_obj:function (req, object, callback) {
        var self = this;
        var user_id = req.session.user_id;
        var info_item_id = req._id;
        var tag_name = req.body.tag_name;
        var is_tag_sugg_approved = {flag : false, index_of_tag_suggestion : null};
        var event = "tag_suggestion_approved";

        //TODO do i need to move it to Gamification resource???
        var iterator = function(user, itr_cbk){
            var inc_gamification = {};

            inc_gamification['gamification.' + event] = 1;
            models.User.update({_id:user_id}, {$inc: inc_gamification}, function (err, result) {
                itr_cbk(err, result);
            });
        };

        async.waterfall([
            function (cbk) {
                models.InformationItem.findById(info_item_id, cbk);
            },

            function (info_item_obj, cbk) {
                var is_tag_already_exist = false;
                for (var i = 0; i < info_item_obj.tags.length; i++) {
                    if (info_item_obj.tags[i].toLowerCase() == tag_name.toLowerCase()) {
                        is_tag_already_exist = true;
                        break;
                    }
                }

                if (is_tag_already_exist) {
                    cbk({message:"tag is already exist", code:401}, null);
                }
                else {
                    var is_tag_suggestoin_exist = false;
                    var is_user_already_suggeted_this_tag = false;
                    for (var i = 0; i < info_item_obj.tag_suggestions.length; i++) {
                        if (info_item_obj.tag_suggestions[i].tag_name.toLowerCase() == tag_name.toLowerCase()) {
                            is_tag_suggestoin_exist = true;

                            //if user hasnt already suggested this tag name, insert his id to the arr
                            for (var j = 0; j < info_item_obj.tag_suggestions[i].tag_offers.length; j++) {
                                if (info_item_obj.tag_suggestions[i].tag_offers[j] == user_id) {
                                    is_user_already_suggeted_this_tag = true;
                                    break;
                                }
                            }

                            if (is_user_already_suggeted_this_tag) {
                                cbk({message:"user already suggested this tag", code:401}, null);
                                break;
                            } else {
                                //this happens when tag is already exist, so we push user to offers list
                                info_item_obj.tag_suggestions[i].tag_offers.push(user_id);
                                req.gamification_type = "suggest_tag_for_info_item";
                                req.token_price = SUGGEST_TAG_PRICE;

                                //if tag is approved
                                if(info_item_obj.tag_suggestions[i].tag_offers.length >= NUM_OF_TAG_SUGG_BEFORE_APPROVAL){
                                    info_item_obj.tags.push(tag_name);
                                    is_tag_sugg_approved.flag = true;
                                    is_tag_sugg_approved.index_of_tag_suggestion = i;
                                }

                                //TODO this is not realy saved!!!!! ishai please help me
                                info_item_obj.save(function(err, info_obj){

                                    if(err){
                                        cbk(err, null);
                                    }
                                    else{
                                        if(is_tag_sugg_approved.flag){
                                            var index = is_tag_sugg_approved.index_of_tag_suggestion;
                                            async.forEach(info_obj.tag_suggestions[index].tag_offers, iterator, cbk);
                                        }
                                    }
                                });
                            }
                            break;
                        }
                    }

                    if (!is_tag_suggestoin_exist) {
                        var new_tag_suggestion = {};
                        new_tag_suggestion.tag_name = tag_name;
                        new_tag_suggestion.tag_offers = [];
                        new_tag_suggestion.tag_offers.push(user_id);

                        req.gamification_type = "suggest_tag_for_info_item";
                        req.token_price = SUGGEST_TAG_PRICE;
                        models.InformationItem.update({_id:info_item_id}, {$addToSet:{"tag_suggestions":new_tag_suggestion}}, cbk)
                    }
                }
            }
        ], callback);
    }
});

//when admin approves infoitem:
//status change to "approved"
//user get gamification for it
//set user notifications
module.exports.approveInfoItem = function(id,callback){

    var score = 10;
    var game_type = "approved_information_item";
    var notification_type = "approved_info_item_i_created";
    var creator_id;
    var info_item_id;

    async.waterfall([
        function(cbk){
            models.InformationItem.findById(id,cbk);
        },

        function(info_item, cbk){
            info_item.status = "approved";
            info_item.save(cbk);
        },

        function(info_obj, cbk){
            var inc_user_gamification = {};
            info_item_id = info_obj._id;
            creator_id = info_obj.created_by.creator_id;

            inc_user_gamification['gamification.'+game_type] = 1;
            inc_user_gamification['score'] = score[game_type] || 0;

            models.User.update({_id: creator_id},{$inc:inc_user_gamification}, cbk);
        },

        //notification for creator
        function(obj, cbk){
            notifications.create_user_notification(notification_type, id, creator_id, null, null, '/information_items/' + id, cbk);
        },

        //find people that like this info_item and set notification for likers
        function(obj, cbk){
            models.Like.find({info_item_id: info_item_id}, cbk);
        },

        function(likes, cbk){
            async.forEach(likes, iterator, cbk);
        }

    ], function(err, obj){
        callback(err, obj);
    })

    var iterator = function(like, itr_cbk){
        notifications.create_user_notification("approved_info_item_i_liked", id, creator_id, null, null,'/information_items/' + id, itr_cbk);
    }
}

