/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 21/03/12
 * Time: 10:48
 * To change this template use File | Settings | File Templates.
 */

var jest = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async');

var LikeResource = module.exports = jest.MongooseResource.extend({
    init:function(){
        this._super(models.Like,'vote');
        this.allowed_methods = ['get','post'];
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id: null};
    },

    create_obj: function(req,fields,callback){
        var self = this;
        var info_item_id = req.body.info_item_id;
        var user_id = req.user._id;
        async.waterfall([

            function(cbk){
                models.Like.find({user_id: user_id, info_item_id: info_item_id}, cbk);
            },


            function(arr, cbk){
                if (arr.length){
                    cbk({message: "Error: user has already liked this item ", code: 401}, null);

                }else{
                    models.InformationItem.update({_id: info_item_id}, {$inc: {like_counter: 1}}, function(err,count)
                    {
                        cbk(err,count);
                    });
                }
            },

            function(result, cbk){
                var like_object = new self.model();
                fields.user_id = user_id;

                for(var field in fields)
                {
                    like_object.set(field,fields[field]);
                }

                self.authorization.edit_object(req, like_object, cbk);
            },

            function(like_obj, cbk){
                like_obj.save(cbk);
            }
        ],function(err, result){
            callback(err, result);
        });
    }
});
