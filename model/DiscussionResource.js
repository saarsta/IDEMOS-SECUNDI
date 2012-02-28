/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 23/02/12
 * Time: 12:02
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common');

//Authorization
var Authoriztion = function() {};
util.inherits(Authoriztion,resources.Authorization);

Authoriztion.prototype.limit_object_list = Authoriztion.prototype.limit_object = function(req, query, callback){

    if(req.session.auth.user){
        var id = req.session.user_id;

        if (req.method == "PUT" || req.method  == "DELETE"){
            query.where('is_published', false).where('creator_id', id);
            callback(null, query);
        }else{
            query.or([{ 'is_published': true }, {'creator_id': id }]);
            callback(null, query);
        }
    }else{
        callback("Error: User Is Not Authenticated", null);
    }
};

//seems like it works, but i might need to add the code above to edit_object
/*
Authoriztion.prototype.edit_object = function(req,object,callback){

    var abc = 8;
}

*/


var DiscussionResource = module.exports = function(){

    DiscussionResource.super_.call(this,models.Discussion);
    this.allowed_methods = ['get','post','put','delete'];
    this.authentication = new common.SessionAuthentication();
    this.filtering = {subject_id: null, users: null, is_published:null};
    this.authorization = new Authoriztion();
   /* this.default_query = function(query)
    {
        return query.where('is_published',true).sort('creation_date','descending');
    };*/

}

util.inherits(DiscussionResource, resources.MongooseResource);


DiscussionResource.prototype.get_object = function(req,id,callback){

    var discussion_id = req.discussion;
    models.Discussion.findOne({_id :discussion_id},function(err,object)
    {
        if(err)
        {
            callback(err, null);
        }
        else
        {
            callback(null, object);
        }

    });
},

DiscussionResource.prototype.create_obj = function(req,fields,callback)
{
    var user_id = req.session.user_id;
    var self = this;
    var object = new self.model();

    models.User.findOne({_id :user_id},function(err,user){
        if(err)
        {
            callback(err, null);
        }
        else
        {
            fields.creator_id = user_id;
            fields.first_name = user.first_name;
            fields.last_name = user.last_name;
            fields.users = user_id;


            for( var field in fields)
            {
                object.set(field,fields[field]);
            }
            self.authorization.edit_object(req,object,function(err,object)
            {
                if(err) callback(err);
                else
                {
                    object.save(function(err,object)
                    {

                            callback(self.elaborate_mongoose_errors(err),object);

                    });
                }
            });
        }
    });

    
    

},

DiscussionResource.prototype.update_obj = function(req,object,callback){

    if(object.is_published){
        callback("this discussion is already published", null);
    }else{
        object.is_published = true;
        object.save(callback);
    }
}

/*
DiscussionResource.prototype.delete_obj = function(req,object,callback){

    if(object.is_published){
        callback("cant delete published discussion", null);
    }else{
        object.delete(function(err)
        {
            if(err) callback(err);
            else
                callback(null,{});
        });
    }
}
*/


