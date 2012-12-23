var models = require('../../../models')
      ,async = require('async')
    ,_ = require('underscore')
    ,notifications = require('../../../api/notifications.js');
                                           //50c430b5d18ea20200000028   50c43377d18ea2020000002c  50c0968895f1e90200000026
module.exports = function(req, res){

    var winners,
        candidate_win_ratio=0,

        game_code       =req.session.election_game.game_code;
    async.waterfall([

        function(cbk){/// determine game results
            winners= determineWinners(req.session.election_game);
            cbk(null,winners);

        },
        function(winners,cbk){ /// update game statistics

            models.QuoteGameGames.update({game_code: game_code}, { first :   winners[0].candidate, second :  winners[1].candidate,third :winners[2].candidate }, function(err,count)
            {
                cbk(err,count);
            });

        },
        function(count,cbk){    /// get winners portion
            candidate_win_ratio=0;
            models.QuoteGameGames.find({first: { $exists: true }}, function(err,games)
            {
                var winner_count=0;
                _.each(games, function(element, index, list){
                    if(element.first==winners[0].candidate)
                    {
                        winner_count++;
                    }
                })
                candidate_win_ratio= Math.round((100*winner_count)/games.length);
                cbk(err);
            }) ;

        },


    ],function(err, result){



    models.QuoteGameCandidate.find({ _id:  {$in:[winners[0].candidate,winners[1].candidate, winners[2].candidate]}})
        .populate('party_19th_knesset', { _id: 1, name: 1 , overview:1, wikipedia_link:1,open_knesset_id:1,sandtalk_id:1 })
        .populate('party_18th_knesset', { _id: 1, name:1, open_knesset_id:1,sandtalk_id:1})
        // .populate("proxy.user_id"/*,['id','_id','first_name','last_name','avatar','facebook_id','num_of_given_mandates', "followers",'score','num_of_proxies_i_represent']*/)
        .exec(function(err, candidates){
            candidates[1].score=  22;
            candidates[2].score=  2;
            var first,second,third, liked_1, liked_2;
            _.each(candidates, function(element, index, list){
                if(element._id== winners[0].candidate){
                    first=    element;
                    first.score=winners[0].score;
                }
                if(element._id== winners[1].candidate){
                    second=    element;
                    second.score=winners[1].score;
                }
                if(element._id== winners[2].candidate){
                    third=    element;
                    third.score=winners[2].score;
                }
            });

            res.render('elections_game_results.ejs', {
               winners: [first, second,  third],
               second:second,
               third:  third,
               first_win_ratio: candidate_win_ratio ,
                quotes_count: _.keys(req.session.election_game).length -1
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
        })
    });


    function determineWinners(results){
        var candidates={};
        _.each(results, function(element, index, list){
            if(!candidates[element.candidate]) {
                candidates[element.candidate]=[];
            }
            if(element.response!='skip'){
                var score=  0 ;
                switch (element.response) {

                    case 'very_positive':
                        score=10;
                        break;
                    case 'positive':
                        score=8;
                        break;
                    case 'negative':
                        score=2;
                        break;
                    case 'very_negative':
                        score=0;
                        break;
                }
                candidates[element.candidate].push(score);
            }
        } );
        candidates_scors=[];
        _.each(candidates, function(element, index, list){
            var sum=_.reduce(element, function(memo, num){ return memo + num; }, 0);
            var final_score = Math.round( (10* sum)/ element.length );
            candidates_scors.push({candidate :index , score:final_score}) ;
        });

        return   _.sortBy(candidates_scors, function(candidate){ return -candidate.score });
    }
};