var models = require('../../../models')
      ,async = require('async')
    ,_ = require('underscore')
    ,notifications = require('../../../api/notifications.js');
                                           //50c430b5d18ea20200000028   50c43377d18ea2020000002c  50c0968895f1e90200000026
module.exports = function(req, res){
    var winner = req.params[0]  || '50c434f0d18ea20200000030';
    models.QuoteGameCandidate.find({ _id:  {$in:[winner,'50c434f0d18ea20200000030','50c436bfd18ea20200000034', '50c468c9a17227020000011b']}})
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
               winners: [first, candidates[1],  candidates [2]],
               second: candidates[1],
               third:  candidates [2],
               first_win_ratio: 18.64
               /*meta: {
                    type: req.app.settings.facebook_app_name + ':discussion',
                    id: discussion.id,
                    image: ((discussion.image_field_preview && discussion.image_field_preview.url) ||
                        (discussion.image_field && discussion.image_field.url)),
                    title: discussion && discussion.title,
                    description: discussion.text_field_preview || discussion.text_field,
                    link: discussion && ('/discussions/' + discussion.id)
                }*/
            });
        });

};