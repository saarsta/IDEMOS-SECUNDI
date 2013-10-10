var models = require('../../models');
var async = require('async');
var _ = require('underscore');

module.exports = function(req, res){

    var user = req.session.user;

    getSettingsParams(req, user, function(err, user_obj, discussion_list, cycle_list, user_discussions_hash, user_cycles_hash){

        res.render('mail_configuration.ejs',{
            title:"הגדרות עדכונים",
            user: user_obj,
            discussions: discussion_list,
            discussions_hash: user_discussions_hash,
            cycles: cycle_list,
            cycles_hash: user_cycles_hash,
            selected_item: ""
        });
    })
}

/***
 * parallel:
 * 1) get user by id and populate his cycles
 * 2) get followed discussions
 * Final) cbk with arguments (user, discussions) or err
 */
var getSettingsParams = module.exports.getSettingsParams = function(req,user,callback) {
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
                .populate("cycles.cycle_id", {
                    "_id" : 1,
                    "title":1})
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
        }
    ], function(err, args){
        var user_obj = args[0];
        var discussion_list = args[1];
        var discussion_list_of_discussions_in_user_discussions = [];
        var cycle_list;
        var user_discussions_hash = {};
        var user_cycles_hash = {};

        _.each(discussion_list, function(discussion){
            if(_.any(user_obj.discussions, function(user_discussion){ return user_discussion.discussion_id  + "" ===  discussion.id})){
                discussion_list_of_discussions_in_user_discussions.push(discussion);
            }
        })
        _.each(user_obj.discussions, function (discussion) {
            user_discussions_hash[discussion.discussion_id + ""] = discussion;
        });

        var cycle_list = _.map(user_obj.cycles, function (cycle) {
            return cycle.cycle_id
        });

        _.each(user_obj.cycles, function (cycle) {
            if(cycle.cycle_id)
                user_cycles_hash[cycle.cycle_id._id + ""] = cycle;
        });

        user_obj = _.extend(user_obj, user);
        callback(err, user_obj, discussion_list_of_discussions_in_user_discussions, cycle_list, user_discussions_hash, user_cycles_hash);
    })
}
