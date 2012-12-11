var models = require('../../../models')
      ,async = require('async')
    ,_ = require('underscore')
    ,notifications = require('../../../api/notifications.js');

module.exports = function(req, res){
    var winner = req.params[0]  || '50c430b5d18ea20200000028';
    models.QuoteGameCandidate.find({ _id:  {$in:[winner,'50c43377d18ea2020000002c','50c0968895f1e90200000026', '50c430b5d18ea20200000028']}})
        .populate('party_19th_knesset', { _id: 1, name: 1 , overview:1, wikipedia_link:1,open_knesset_id:1,sandtalk_id:1 })
        .populate('party_18th_knesset', { _id: 1, name:1, open_knesset_id:1,sandtalk_id:1})
        // .populate("proxy.user_id"/*,['id','_id','first_name','last_name','avatar','facebook_id','num_of_given_mandates', "followers",'score','num_of_proxies_i_represent']*/)
        .exec(function(err, candidates){
            candidates [1].score=  22;
            candidates [2].score=  2;
            var first;
            _.each(candidates, function(element, index, list){
                if(element._id== winner){
                    first=    element;
                    first.score=72;
                }

            });

            res.render('elections_game_results.ejs', {
               first: first,
               second: candidates[1],
               third:  candidates [2],
               first_win_ratio: 18.64
            });
        });

};