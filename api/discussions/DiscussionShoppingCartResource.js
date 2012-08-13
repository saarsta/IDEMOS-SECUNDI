/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 26/02/12
 * Time: 19:26
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../../models'),
    common = require('../common.js');



////Authorization
var Authoriztion = function() {};
util.inherits(Authoriztion,resources.Authorization);

Authoriztion.prototype.limit_object_list = function(req, query, callback){

    var id = req.query.discussion_id;
    query.where('discussions', id);
    callback(null, query);
};

var DiscussionShoppingCartResource = module.exports = function()
{
    DiscussionShoppingCartResource.super_.call(this,models.InformationItem);
    this.allowed_methods = ['get','post', 'put', 'delete'];
    this.authentication = new common.SessionAuthentication();
    this.authorization = new Authoriztion();
    this.default_query = function(query)
    {
        return query.where('is_visible',true).sort({creation_date:'descending'});
    };
};


util.inherits(DiscussionShoppingCartResource,resources.MongooseResource);

DiscussionShoppingCartResource.prototype.update_obj = function(req,object,callback){


    console.log("inside DiscussionShoppingCartResource update.obj");
    var discussion_id = req.body.discussion_id;
    console.log(discussion_id);
    var is_exist = false;
    for(var i=0; i<object.discussions.length; i++){
        if (object.discussions[i] == discussion_id){
            is_exist = true;
            break;
        }
    }
    if(is_exist){
        callback("information item is already in discussion shoping cart", null);
    }else{
        //add item to discussion's shopping cart
        object.discussions.push(discussion_id);

        //add notification for user

        object.save(callback);
    }
}

DiscussionShoppingCartResource.prototype.delete_obj = function(req,object,callback){

    console.log("inside DiscussionShoppingCartResource delete_obj");
    var discussion_id = req.body.discussion_id;
    var test = req.query.discussion_id;

    for(var i=0; i<object.discussions.length; i++)
    {
        if(object.discussions[i] == test)
        {
            object.discussions.splice(i,1);
            i--;
        }
    }
    object.save(callback);
}
