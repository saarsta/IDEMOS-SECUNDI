/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 23/02/12
 * Time: 12:03
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    util = require('util'),
    models = require('../models'),
    common = require('./common');


var PostResource = module.exports = function(){

    PostResource.super_.call(this,models.Post);
    this.allowed_methods = ['get','post','put','delete'];
    this.authentication = new common.SessionAuthentication();
    this.filtering = {discussion_id: null};
    this.default_query = function(query)
    {
        return query.sort('creation_date','descending');
    };
//    this.validation = new resources.Validation();=
}

util.inherits(PostResource, resources.MongooseResource);

PostResource.prototype.create_obj = function(req,fields,callback)
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
}