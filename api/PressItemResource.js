/**
 * Created with JetBrains WebStorm.
 * User: Lior
 * Date: 4/22/13
 * Time: 2:49 PM
 * To change this template use File | Settings | File Templates.
 */
jest = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common'),
    async = require('async');

var PressItemResource = module.exports = jest.MongooseResource.extend({
    init:function(){
        this._super(models.PressItem);
        this.allowed_methods = ['get'];
        this.default_query = function (query) {
            return query.sort({'date': 'descending'});
        };
    }    ,

    get_objects:function (req, filters, sorts, limit, offset, callback) {

        this._super(req, filters, sorts, limit, offset, function (err, results) {

            if(err) {
                callback(err);
            }
            else {
                var discussion_id           =req.query.discussion_id;
                if(discussion_id){
                    models.Discussion.findById(discussion_id, function ( err, obj){
                        var discussion_press_items=obj.press_items ;
                        var discussion_press_items_ids= _.map(discussion_press_items, function(press_item){ return press_item.press_item_id+"";});
                        var final_results=JSON.parse(JSON.stringify(results));
                        final_results.objects=[];
                        _.each(results.objects,function(o){
                            if(_.contains(discussion_press_items_ids, o.id ))  {
                                final_results.objects.push(o);
                            }
                        });
                        final_results.meta.total_count=final_results.objects.length;
                        callback(err, final_results);
                    });

                }
                else    {
                    callback(err, results);
                }

            }


        });
    }
});