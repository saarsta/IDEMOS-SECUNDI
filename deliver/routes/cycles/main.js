
var models = require('../../../models'),
    async = require('async');

/*
*  1. find cycle by id
*  2. find cycle followers
*  3.
*       3.1 for each follower find join date by finding the specific cycle in the list
*       3.2 sort followers - fb friends, proxies, followed by me, others
*  4. find opinion shapers
*  5. find proxy of user
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
                'opinion_shapers': 1
            })
            .populate('opinion_shapers.user_id', {
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
        },

//        //get cycle opinion shapers
//        function(cbk){
//            models.OpinionShaper.find({cycle_id: req.params[0]})
//                .limit(3)
//                .populate('user_id', {
//                    '_id':1,
//                    'first_name':1,
//                    'last_name':1,
//                    'avatar': 1,
//                    'facebook_id':1,
//                    'avatar_url':1,
//                    'score':1,
//                    'num_of_proxies_i_represent':1
//                })
//                .exec(function(err, results){
//                    _.each(results, function(obj){obj.user_id.avatar = obj.user_id.avatar_url()});
//                    results = JSON.parse(JSON.stringify(results));
//                    _.each(results, function(obj){ obj.user_id.opinion_text = obj.text});
//                    cbk(err, results);
//                })
//        },

        // get the user object
        function (cbk) {
            if (req.session.user)
                models.User.findById(req.session.user._id, cbk);
            else {
                cbk(null, null);
            }
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
            _.each(g_cycle.opinion_shapers, function(opinion_shaper){ opinion_shaper.user_id.avatar_url = opinion_shaper.user_id.avatar_url();});

            var users = args[1] || [];

            var proxyJson = args[3] ? JSON.stringify(args[3].proxy) : null;
            var user_id = req.session.user ?  req.session.user._id + "" : 0;

            if(g_cycle.followers_count != users.length){
                //fix follower count
                models.Cycle.update({_id: args[0]._id}, {$set: {followers_count: users.length}}, function(err, result){
                    g_cycle.followers_count = users.length;
                    if(g_cycle && g_cycle.main_subject)
                        g_cycle.subject_name = g_cycle.main_subject.name;

                    g_cycle.is_user_follower_of_cycle = _.any(users, function(user){return user._id + "" == user_id});
                    res.render('cycle.ejs',{
                        cycle: g_cycle,
                        tab:'cycles',
                        proxy:proxyJson
                    });
                })
            }else{
                if(g_cycle && g_cycle.main_subject)
                    g_cycle.subject_name = g_cycle.main_subject.name;
                g_cycle.is_user_follower_of_cycle = _.any(users, function(user){return user._id + "" == req.session.user ? req.user.id : 0});
                res.render('cycle.ejs',{
                    cycle: g_cycle,
                    tab:'cycles',
                    proxy:proxyJson
                });
            }
        }
    })
};
