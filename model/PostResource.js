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
    async = require('async'),
    POST_PRICE = 1;


/*//Authorization
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
 if (object.tokens >= POST_PRICE){
 callback(null, object);
 }else{
 callback({message:"Error: Unauthorized - there is not enought tokens",code:401}, null);
 }
 }
 });
 }
 else{
 callback({message:"Error: User Is Not Autthenticated",code:401}, null);
 }
 };*/

var PostResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {

        this._super(models.Post, 'post');
        this.allowed_methods = ['get', 'post'];
        this.authorization = new common.TokenAuthorization();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id:null};
        this.default_query = function (query) {
            return query.sort('creation_date', 'descending');
        };
//    this.validation = new resources.Validation();=
    },

    create_obj:function (req, fields, callback) {

        var user_id = req.session.user_id;
        var self = this;
        var post_object = new self.model();
        var user = req.user;

        async.waterfall([

            function(cbk){
                fields.creator_id = user_id;
                fields.first_name = user.first_name;
                fields.last_name = user.last_name;

                for (var field in fields) {
                    post_object.set(field, fields[field]);
                }
                self.authorization.edit_object(req, post_object, cbk);
                g_user = user;
            },

            function(post_object, cbk){

                var discussion_id = post_object.discussion_id;
                post_object.save(function(err,result,num)
                {
                    cbk(err,result);
                });
            },
            function (object,cbk) {
                var discussion_id = object.discussion_id;
                //if post created successfuly, add user to discussion
                // + add discussion to user
                //  + take tokens from the user
                async.parallel([
                    function(cbk2)
                    {
                        models.Discussion.update({_id:object.discussion_id}, {$addToSet: {users: user_id}}, cbk2);

                    },
                    function(cbk2)
                    {
                            // add discussion_id to the list of discussions in user
                        user.tokens -= POST_PRICE;
                        if (common.isArgIsInList(object.discussion_id, user.discussions) == false) {
                            user.discussions.push(object.discussion_id);
                        }
                        user.save(function(err,result)
                        {
                            cbk2(err,result);
                        });
                    }
                    ],
                    cbk);

            }
        ],function(err,result)
        {
            callback(self.elaborate_mongoose_errors(err), post_object);
        });
    }
});

//util.inherits(PostResource, resources.MongooseResource);
//
//PostResource.prototype.create_obj =
//}
//

