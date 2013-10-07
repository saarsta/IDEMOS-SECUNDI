
var jest = require('jest')
    ,models = require('../models')
    ,common = require('./common')
    ,async = require('async')
    ,_ = require('underscore');

var ItemsByTagResource = module.exports = jest.Resource.extend({
    init:function(){
        this._super();
        this.allowed_methods = {
            get: {
                list:null
            }
        };
        this.authentication = new common.SessionAuthentication();
        this.filtering = {
            tag_name:null
        };
        this.sorting = {};
        this.fields = {
            _id: null,
            info_items_count: null,
            discussions_count:null,
            cycles_count: null,
            actions_count: null
        }
    },
    get_objects:function(req,filters,sorts,limit,offset,callback)
    {
        var tag_name = filters.tag_name;
        var cycles_count;
        var discussions_count;
        var info_items_count;
        var actions_count;

        var query = {};
        if(tag_name)
            query['tags'] = tag_name;

        async.parallel([
            function(cbk){
                models.Cycle.count(query,cbk);
            },

            function(cbk){
                models.Discussion.count(_.extend({is_published:true},query), cbk);
            },

            function(cbk){
                models.InformationItem.count(_.extend({status: "approved", is_visible: true},query), cbk);
            },

            function(cbk){
                models.Action.count(query,cbk);
            }

        ], function(err, args){
            callback(err,{
                cycles_count: args[0] || 0,
                discussions_count:args[1]|| 0,
                info_items_count: args[2]|| 0,
                actions_count: args[3]|| 0,
            });
        });
    }
});
