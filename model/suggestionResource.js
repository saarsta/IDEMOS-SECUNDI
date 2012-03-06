/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 05/03/12
 * Time: 18:12
 * To change this template use File | Settings | File Templates.
 */

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
    common = require('./common'),
    CHANGE_SUGGESTION_PRICE = 2;



//Authorization
var Authoriztion = function() {};
util.inherits(Authoriztion,resources.Authorization);

Authoriztion.prototype.edit_object = function(req,object,callback){

    if(req.session.user_id){
        var user_id = req.session.user_id;
        models.User.findOne({_id :user_id},function(err,object)
        {
            if(err)
            {
                callback(err, null);
            }
            else
            {

                if (object.tokens >= CHANGE_SUGGESTION_PRICE){
                    callback(null, object);
                }else{
                    callback("Error: Unauthorized - there is not enought tokens", null);
                }
            }
        });
    }
    else{
        callback("Error: User Is Not Autthenticated", null);
    }
};

var SuggestionResource = module.exports = function(){

    SuggestionResource.super_.call(this,models.Suggestion);
    this.allowed_methods = ['get','post'];
    this.authorization = new Authoriztion();
    this.authentication = new common.SessionAuthentication();
    this.filtering = {discussion_id: null};
    this.default_query = function(query)
    {
        return query.sort('creation_date','descending');
    };
//    this.validation = new resources.Validation();=
}

util.inherits(SuggestionResource, resources.MongooseResource);

SuggestionResource.prototype.create_obj = function(req,fields,callback)
{
    var user_id = req.session.user_id;
    var self = this;
    var suggestion_object = new self.model();

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
                suggestion_object.set(field,fields[field]);
            }

            self.authorization.edit_object(req, suggestion_object,function(err, user_object)
            {
                if(err) callback(err);
                else
                {
                    suggestion_object.save(function(err,suggestion_object)
                    {
                        //if suggestion created successfuly, take tokens it from the user
                        if (!err){


                            user_object.tokens -= CHANGE_SUGGESTION_PRICE;
                            user_object.save(function(err, object){
                                callback(self.elaborate_mongoose_errors(err), suggestion_object);
                            });
                        }else{
                            callback(self.elaborate_mongoose_errors(err), null);
                        }
                    });
                }
            });
        }
    });
}