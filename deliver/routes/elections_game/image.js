var models = require('../../../models')
    ,async = require('async')
    ,im = require('node-imagemagick')
    ,notifications = require('../../../api/notifications.js');

module.exports = function(req,res)
{


    models.QuoteGameCandidate.find({ _id:  {$in:[req.query.first_id , req.query.second_id, req.query.third_id]}})
        .populate('party_19th_knesset', { _id: 1, name: 1 , overview:1, wikipedia_link:1,open_knesset_id:1,sandtalk_id:1 })
        .populate('party_18th_knesset', { _id: 1, name:1, open_knesset_id:1,sandtalk_id:1})
        .exec(function(err, candidates){




                var first,second,third;
                _.each(candidates, function(element, index, list){
                    if(element._id== req.query.first_id){
                        first=    element;
                        first.score=req.query.first_score;
                    }
                    if(element._id== req.query.second_id){
                        second=    element;
                        second.score=req.query.second_score;
                    }
                    if(element._id== req.query.third_id){
                        third=    element;
                        third.score=req.query.third_score;
                    }
                });
                res.render('elections_game_image.ejs', {
                    first: first,
                    second:second,
                    third:  third
                });


        });

};
