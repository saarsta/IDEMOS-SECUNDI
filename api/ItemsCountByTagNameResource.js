
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
        this.filtering = {};
        this.sorting = {};
        this.fields = {
            _id: null,
            info_items_count: null,
            discussions_count:null,
            cycles_count: null,
            actions_count: null,
            blogs_count: null
        }
    },
    get_objects:function(req,filters,sorts,limit,offset,callback)
    {
        var tag_name = req.query.tag_name;
        var cycles_count;
        var discussions_count;
        var info_items_count;
        var actions_count;
        var blogs_count;

        async.parallel([
            function(cbk){
                models.Cycle.count({tags: tag_name},cbk);

            },

            function(cbk){
                models.Discussion.count({tags: tag_name}, cbk);
            },

            function(cbk){
                models.InformationItem.count({tags: tag_name}, cbk);
            },

            function(cbk){
                models.Action.count({tags: tag_name},cbk);
            },

            function(cbk){
                models.Article.count({tags: tag_name}, cbk);
            }

        ], function(err, args){
            callback(err,{
                info_items_count: args[0],
                discussions_count:args[1]|| null,
                cycles_count: args[2]|| null,
                actions_count: args[3]|| null,
                blogs_count: args[4]|| null
            });
        });
    }
});
