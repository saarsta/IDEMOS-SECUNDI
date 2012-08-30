
var models = require('../../../models'),
    async = require('async');

/*
*  1. find cycle by id
*  2. find cycle followers
*  3.
*       3.1 for each follower find join date by finding the specific cycle in the list
*       3.2 sort followers - fb friends, proxies, followed by me, others
*  4. find opinion shapers
*  final - render the cycle page
*
* */

module.exports = function(req, res){

    var g_cycle;

    async.parallel([
        //1. find cycle by id
        function(cbk){
            models.Cycle.findById(req.params[0])
            .select({
                '_id':1,
                'subject':1,
                'main_subject':1,
                'title':1,
                'discussion_title':1,
                'text_field':1,
                'image_field':1,
                'discussions':1,
                'tags':1,
                'opinion_shapers':1
            })
            .populate('opinion_shapers', {
                '_id':1,
                'first_name':1,
                'last_name':1,
                'avatar': 1,
                'facebook_id':1,
                'avatar_url':1,
                'score':1,
                'num_of_proxies_i_represent':1,
                'opinion_text':1
                })
            .populate('main_subject', {'name':1})
            .exec(cbk);
        },

        //find cycle followers
        function(cbk){
                models.User.find({"cycles.cycle_id": req.params[0]}, cbk);
        }
       //final - render the cycle page
    ], function(err, args){

        if(err)
            res.render('500.ejs',{error:err});
        else if (!args[0]){
                res.redirect('/cycles');
        }
        else {


            g_cycle = args[0];
            var users = args[1] || [];

            _.each(g_cycle.opinion_shapers, function(user){user.avatar = user.avatar_url()});
            if(g_cycle.followers_count != users.length){
                //fix follower count
                models.Cycle.update({_id: args[0]._id}, {$set: {followers_count: users.length}}, function(err, result){
                    g_cycle.followers_count = users.length;
                    if(g_cycle && g_cycle.main_subject)
                        g_cycle.subject_name = g_cycle.main_subject.name;
                    g_cycle.is_user_follower_of_cycle = _.any(users, function(user){return user._id + "" == req.session.user ? req.user.id : 0});
                    res.render('cycle.ejs',{
                        cycle: g_cycle,
                        tab:'cycles'
                    });
                })
            }else{
                if(g_cycle && g_cycle.main_subject)
                    g_cycle.subject_name = g_cycle.main_subject.name;
                g_cycle.is_user_follower_of_cycle = _.any(users, function(user){return user._id + "" == req.session.user ? req.user.id : 0});
                res.render('cycle.ejs',{
                    cycle: g_cycle,
                    tab:'cycles'
                });
            }
        }
    })
};
