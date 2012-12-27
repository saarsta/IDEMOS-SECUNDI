var models = require('../../../models')
      ,async = require('async')
    ,_ = require('underscore')
    ,md5 = require('MD5')
    ,http = require('http')
    ,fs = require('fs')
    ,url = require('url')
    ,notifications = require('../../../api/notifications.js');
                                           //50c430b5d18ea20200000028   50c43377d18ea2020000002c  50c0968895f1e90200000026
module.exports = function(req, res){

    var winners,
        candidate_win_ratio=0,

        game_code       =req.session.election_game ? req.session.election_game.game_code:null;
        async.waterfall([

        function(cbk){/// determine game results
            if(!game_code)  {
                cbk('no game');
            }   else  {

                winners= determineWinners(req.session.election_game);
                cbk(null,winners);
            }

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

    if(err!=null){
        console.log(err);
        if(req.params[0]){
            candidate_win_ratio=50;
            winners=[];
            winners.push({candidate :req.params[0] , score:70}) ;
            winners.push({candidate :req.params[0] , score:70}) ;
            winners.push({candidate :req.params[0] , score:70}) ;
        }   else {
            res.writeHead(302, {
                'Location': '/elections_game'
                //add other headers here...
            });
            res.end();
            return;
        }
    }   /*

            response.writeHead(302, {
                'Location': 'your/404/path.html'
                //add other headers here...
            });
            response.end();
          */
    models.QuoteGameCandidate.find({ _id:  {$in:[winners[0].candidate,winners[1].candidate, winners[2].candidate]}})
        .populate('party_19th_knesset', { _id: 1, name: 1 , overview:1, wikipedia_link:1,open_knesset_id:1,sandtalk_id:1 })
        .populate('party_18th_knesset', { _id: 1, name:1, open_knesset_id:1,sandtalk_id:1})
        // .populate("proxy.user_id"/*,['id','_id','first_name','last_name','avatar','facebook_id','num_of_given_mandates', "followers",'score','num_of_proxies_i_represent']*/)
        .exec(function(err, candidates){
            if (candidates.length==1)
            {
                candidates[1]=JSON.parse(JSON.stringify( candidates[0]));
                candidates[2]=JSON.parse(JSON.stringify( candidates[0]));
            }
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

            var share_url="uru-staging.herokuapp.com/elections_game/image?first_id="+first._id+"&first_score="+first.score+"&second_id="+second._id+"&second_score="+second.score+"&third_id="+third._id+"&third_score="+third.score;
            var share_url_encoded=encodeURIComponent(share_url);
            var share_query_string="url="+share_url_encoded+"&viewport=870x447";
            var share_token  = md5(share_query_string + req.app.settings.url2png_api_secret)
            var share_img="http://beta.url2png.com/v6/P503113E58ED4A/"+share_token+"/png/?"+share_query_string;


            download_file_httpget(share_img,'deliver/public/images/eg/'+first._id+first.score+second._id+second.score+third._id+third.score+'.png') ;
            res.render('elections_game_results.ejs', {
               winners: [first, second,  third],
               second:second,
               third:  third,
               first_win_ratio: candidate_win_ratio ,
               share_img:share_img,
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

    var download_file_httpget = function(file_url,target) {
        var options = {
            host: url.parse(file_url).host,
            port: 80,
            path: url.parse(file_url).pathname
        };

        var file_name = url.parse(file_url).pathname.split('/').pop();
        var file = fs.createWriteStream(target);

        http.get(file_url, function(res) {
            res.on('data', function(data) {
                file.write(data);
            }).on('error', function(data) {
                    file.write(data);
                }).on('end', function() {
                    file.end();
                    console.log( 'success');
                });
        });
    };

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