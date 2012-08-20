

var jest = require('jest')
    ,models = require('../models')
    ,common = require('./common')
    ,async = require('async')
    ,_ = require('underscore');

var CycleTimelineResource = module.exports = jest.Resource.extend({
    init:function(){
        this._super();
        this.allowed_methods = {
            get: {
                list:null
            }
        };
        this.authentication = new common.SessionAuthentication();
        this.filtering = {};
        this.sorting = {};
        this.fields = {
            _id: null,
            title: null,
            tooltip_or_title:null,
            type: null,
            text_field_preview: null,
            image_field_preview: null,
            tags: null
        }
    },


    get_objects:function(req,filters,sorts,limit,offset,callback)
    {
        var arr = [];
        var cycle_id = req.body.cycle_id;
        async.parallel([
            function(cbk){
                models.Cycle.findById(cycle_id, function(err, obj){
                    if(!err){
//                        _.each(obj, function(obj){
//                            obj.type = "cycle";
//                        })
                    }

                    cbk(err, objs);
                });
            },

            function(cbk){
                models.Updates.findOne({cycle_id: cycle_id}, function(err, obj){
                    if(!err){
//                        _.each(objs, function(obj){
//                            obj.type = "information_item";
//                        })
                    }

                    cbk(err, objs);
                });
            },
            function(cbk){
                models.Action.find({cycle_id: cycle_id, is_approved: true}, function(err, objs){
                    if(!err){
                        _.each(objs, function(obj){
                            obj.type = "Action";
                        })
                    }

                    cbk(err, objs);
                });
            }
        ], function(err, args){

            arr = _.union.apply(_,args);
//            if(req.user){
//                arr = arr.splice(0, 2);
//            }else{
            arr = arr.splice(0, 4);
//            }

            callback(null,{meta:{total_count: arr.length}, objects: arr});
        });
    }
});
