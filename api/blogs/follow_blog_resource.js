
var resources = require('jest'),
    util = require('util'),
    models = require('../../models'),
    common = require('./../common'),
    async = require('async'),
    _ = require('underscore');


var follow_blog_resource = module.exports = common.GamificationMongooseResource.extend({
    init: function(){
        this._super(models.User, null, 0);
        this.allowed_methods = ['get', 'put'];
        this.authentication = new common.SessionAuthentication();
        this.update_fields = {
            blog_id: null
        },
        this.fields = {
            is_follower: null
        }
    },

    update_obj: function (req, object, callback) {

        var blog_id = req.body.blog_id;
        var blog = _.find(object.blogs, function(blog){return blog.blog_id + "" == blog_id + ""});

        if(blog){
            //delete follower

            blog.remove(function(err, res){
                if(!err){
                    object.save(function(err, obj){
                        obj.is_follower = false;
                        callback(err, obj);
                    })
                }
            })
        }else{
            //add blog
            var new_blog = {
                blog_id: blog_id,
                join_date: Date.now()
            }

            object.blogs.push(new_blog);
            object.save(function(err, obj){
                obj.is_follower = true;
                callback(err, obj);
            })
        }
    }
})