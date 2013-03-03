var jest = require('jest')
    ,models = require('../../models')
    ,common = require('../common')
    ,async = require('async')
    ,_ = require('underscore');

var CycleFBPageResource = module.exports = jest.Resource.extend({
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
    },

    get_objects:function(req,filters,sorts,limit,offset,callback)
    {
        var arr = [];
        if(req.user) {
            //get user cycles
            var user_cycles_ids=_.map( req.user.cycles,function(cycle){
                return cycle._id
            } );
            // get cycles that user is not member of and have facebook page
            models.Cycle.find({_id:{$nin:user_cycles_ids}, "fb_page.fb_id": {$exists: true} }).exec(function(err, cycles){

                arr = cleanArray(_.map(cycles,function(cycle){

                    if(cycle.fb_page.users.indexOf(req.user.facebook_id) ==-1 ){
                        return null;
                    }else{
                        return cycle;
                    }

                }));

                callback(null,{meta:{total_count: arr.length}, objects: arr});
            });
            // for each cycle check if user liked the page
            // if so return the facebook page link and the cycle
            //models.User.find({"cycles.cycle_id":id}, {"_id":1, "username":1, "email":1, "first_name":1, "avatar":1, "facebook_id":1, "cycles":1}, function (err, objs) {
        }
    }

});

function cleanArray(actual){
    var newArray = new Array();
    for(var i = 0; i<actual.length; i++){
        if (actual[i]){
            newArray.push(actual[i]);
        }
    }
    return newArray;
}