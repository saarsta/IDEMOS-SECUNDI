/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 15/02/12
 * Time: 17:15
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    async = require('async'),
    common = require('./common'),
    notifications = require('./notifications'),

    NUM_OF_TAG_SUGG_BEFORE_APPROVAL = 1,
    SUGGEST_TAG_PRICE = 1;

var InformationItemResource = module.exports = common.GamificationMongooseResource.extend(
{
    init:function () {
        this._super(models.InformationItem, null, null);
        this.allowed_methods = ['get', 'post', 'put'];
//        this.authentication = new common.SessionAuthentication();
        this.filtering = {
            tags:null, subject_id:null, title:null, text_field:null, text_field_preview:null, users:null, is_hot_info_item:null, discussions:null};
        this.default_query = function (query) {
            return query.where('is_visible', true).where('status','approved').sort('creation_date', 'descending').populate('subject_id');
        },
        this.fields = {
            _id: null,
            title: null,
            subject_id: {
                _id: null,
                name: null
            },
            category: null,
            text_field: null,
            text_field_preview: null,
            discussions: {
                _id: null,
                title: null
            },
            cycles: null,
            actions: null,
            tags: null,
            like_counter: null,
            view_counter: null
        };
    },

    run_query: function(req,query,callback)
    {
        if(query._conditions.subject_id){
            query.populate('discussions');
        }

        this._super(req, query, callback);
    },

    get_object:function (req, id, callback) {
        this._super(req, id, function(err, object){
           object.user_likes = false;
           if(req.user){
               models.Like.find({user_id: req.user._id, info_item_id: id}, function(err, obj){
                   if(obj)
                      object.user_likes = true;
                   callback(err, object)
               })
           }else{
              callback(err, object)
           }
        });

    },

    get_objects: function (req, filters, sorts, limit, offset, callback) {

        this._super(req, filters, sorts, limit, offset, function(err, results){
            callback(err, results);
        });
    },

    create_obj: function(req,fields,callback){
        var user_id = req.session.user_id;
        var self = this;
        var info_item_object = new self.model();

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
                info_obj.save(cbk);
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
    var notification_type = "approved_info_item";
    var creator_id;

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
            creator_id = info_obj.created_by.creator_id;

            inc_user_gamification['gamification.'+game_type] = 1;
            inc_user_gamification['score'] = score[game_type] || 0;

            models.User.update({_id: creator_id},{$inc:inc_user_gamification}, cbk);
        },

        function(obj, cbk){
            notifications.create_user_notification(notification_type, id,creator_id, null, null, cbk);
        }


    ], function(err, obj){
        callback(err, obj);
    })
}
