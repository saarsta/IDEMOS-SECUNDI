
var resources = require('jest'),
    util = require('util'),
    models = require('../../models'),
    common = require('./../common'),
    async = require('async'),
    _ = require('underscore');


var follow_blog_by_mail_resource = module.exports = common.GamificationMongooseResource.extend({
    init: function(){
        this._super(models.User, null, 0);
        this.allowed_methods = ['get', 'put'];
        this.authentication = new common.SessionAuthentication();
        this.update_fields = {
            blog_id: null,
            mail: null
        },
        this.fields = {
            is_follower: null
        }
    },

    update_obj: function (req, object, callback) {

        var blog_id = req.body.blog_id;
        var mail = req.body.mail;

        var blog = _.find(object.blogs_email, function(blog){return blog.mail == mail});

        if(blog){
            // The blog is already followed. Nothing to do here.
        } else {
            //add blog
            var new_blog = {
                blog_id: blog_id,
                mail: mail,
                join_date: Date.now()
            }

            object.blogs_email.push(new_blog);
            object.save(function(err, obj){
                obj.is_follower = true;
                callback(err, obj);
            })
        }
    }
})