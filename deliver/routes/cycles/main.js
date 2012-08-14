
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

    async.waterfall([
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
                'avatar_url':1,
                'score':1,
                'num_of_proxies_i_represent':1,
                'opinion_text':1
                })
            .populate('main_subject', {'name':1})
            .exec(cbk);
        }/*,

        //2. find cycle followers
        function(cycle, cbk){
            if(!cycle)
                cbk('no cycle');
            else{
                if (cycle.subject)
                     cycle.subject = cycle.subject[0];
                _.each(cycle.opinion_shapers, function(opinion_shaper){ opinion_shaper.avata_url = opinion_shaper.avatar_url()});
                g_cycle = cycle;
                models.User.find({"cycles.cycle_id": cycle._id}, {"_id":1, "cycles":1}, cbk);
            }
        },

        //3.1 for each follower find join date by finding the specific cycle in the list
        //3.2 sort followers - fb friends, proxies, followed by me, others
        function(followers, cbk){
            //3.1 for each follower find join date by finding the specific cycle in the list
            g_cycle.cycle_followers = _.map(followers, function(follower){
                var curr_cycle =  _.find(follower.cycles, function(cycle){
                    return cycle.cycle_id + "" == g_cycle._id + "";
                });

                return {
                    follower: {
                        _id: follower._id,
                        first_name: follower.first_name,
                        last_name: follower.last_name,
                        avatar_url: follower.avatar_url()
                    },
                    join_date: curr_cycle.join_date
                }
            })

            //TODO -
            //3.2 sort followers - fb friends, proxies, followed by me, others

            cbk(null, null);
        }*/


       //final - render the cycle page
    ], function(err, g_cycle){
        if(err)
            res.render('500.ejs',{error:err});
        else {
            if(g_cycle && g_cycle.subject_name)
                g_cycle.subject_name = g_cycle.main_subject.name;
            res.render('cycle.ejs',{
                cycle: g_cycle,
                tab:'cycles'
            });
        }
    })
};
