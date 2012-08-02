
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
            .select(['_id', 'subject', 'title', 'discussions'])
            .exec(cbk);
        },

        //2. find cycle followers
        function(cycle, cbk){
            if(!cycle)
                cbk('no cycle');
            else{
                cycle.subject = cycle.subject[0];
                g_cycle = cycle;
                models.User.find({"cycles.cycle_id": cycle._id}, ["_id", "cycles"], cbk);
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
        },

        //4. find opinion shapers
        function(obj, cbk){
            models.User.find({is_opinion_shaper: true}, [
                '_id',
                'first_name',
                'last_name',
                'avatar_url',
                'score',
                'num_of_proxies_i_represent',
                'opinion_text'
            ]
            , cbk)
        }
       //final - render the cycle page
    ], function(err, opinion_shapers){
        if(err)
            res.render('500.ejs',{error:err});
        else {
                res.render('cycle.ejs',{
                    cycle: g_cycle,
                    tab:'cycles'
                });
        }
    })
};
