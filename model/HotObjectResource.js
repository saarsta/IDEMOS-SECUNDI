/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 09/05/12
 * Time: 17:43
 * To change this template use File | Settings | File Templates.
 */

var jest = require('jest')
    ,models = require('../models')
    ,common = require('./common')
    ,async = require('async')
    ,_ = require('underscore');

var HotObjectResource = module.exports = jest.Resource.extend({
    init:function(){
        this._super();
        this.allowed_methods = {
            get: {
                list:null
//                ,details:null
            }
        };
        this.authentication = new common.SessionAuthentication();
        this.filtering = {};
        this.sorting = {};
        this.fields = {
             _id: null,
            title: null,
            type: null,
            text_field_preview: null,
            image_field_preview: null,
            tags: null
        }
    },
    get_objects:function(req,filters,sorts,limit,offset,callback)
    {
        var arr = [];

        async.parallel([
            function(cbk){
                models.Cycle.find({is_hot_object: true}, function(err, objs){
                    if(!err){
                        _.each(objs, function(obj){
                            obj.type = "cycle";
                        })
                    }

                    cbk(err, objs);
                });
            },

            function(cbk){
                models.InformationItem.find({is_hot_object: true}, function(err, objs){
                    if(!err){
                        _.each(objs, function(obj){
                            obj.type = "information_item";
                        })
                    }

                    cbk(err, objs);
                });
            },
            function(cbk){
                models.Discussion.find({is_hot_object: true}, function(err, objs){
                    if(!err){
                        _.each(objs, function(obj){
                            obj.type = "discussion";
                        })
                    }

                    cbk(err, objs);
                });
            }
        ], function(err, args){

            arr = _.union.apply(_,args);
            if(req.user){
                arr = arr.splice(0, 2);
            }else{
                arr = arr.splice(0, 4);
            }

            callback(null,{meta:{total_count: arr.length}, objects: arr});
        });
    }
});