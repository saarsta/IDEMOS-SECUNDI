var models = require('../../../models');
var async = require('async');
var _ = require('underscore');

module.exports = function(req, res){

    var user = req.session.user;

    async.parallel([
        // get user
        function(cbk){
            models.User.findById(user.id)
                .select({
                    id: 1,
                    first_name: 1,
                    last_name: 1,
                    avatar_url: 1,
                    score: 1,
                    num_of_given_mandates: 1,
                    num_of_proxies_i_represent: 1,
                    has_voted: 1,
                    no_mail_notifications: 1,
                    identity_provider: 1,
                    mail_notification_configuration: 1,
                    discussions: 1,
                    cycles: 1
                })
                .exec(cbk);
        },

        // get followed discussions
        function(cbk){
            models.Discussion.find({"users.user_id": user.id})
                .select({
                    id: 1,
                    title: 1
                }).
                exec(cbk);
        },

        // get followed cycles
        function(cbk){
            models.Cycle.find({"users.user_id": user.id})
                .select({
                    id: 1,
                    title: 1
                }).
                exec(cbk);
        }
    ], function(err, args){
        if(err){
            res.render('500.ejs',{error:err});
        }else{
            var user_obj = args[0];
            var discussion_list = args[1];
            var cycle_list = args[2];
            var user_discussions_hash = {};

            _.each(user_obj.discussions, function (discussion) {
                user_discussions_hash[discussion.discussion_id + ""] = discussion;
            });

            res.render('mail_configuration.ejs',{
                title:"הגדרות עדכונים",
                user: user_obj,
                discussions: discussion_list,
                discussions_hash: user_discussions_hash,
                cycles: cycle_list
            });
        }
    })
}