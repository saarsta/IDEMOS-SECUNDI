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
        candidate_page=false,
        candidate_win_ratio=0,
        share_img_code,
        game_code       =req.session.election_game ? req.session.election_game.game_code:null;
        async.waterfall([

        function(cbk){/// determine game results

            if( req.params[0])  {
                cbk('candidate page');
            } else
            if(!game_code)  {
                cbk('no game code');
            }   else  {

                winners= determineWinners(req.session.election_game);
                cbk(null,winners);
            }

        },
        function(winners,cbk){ /// update game statistics
            models.QuoteGameGames.update({game_code: game_code}, { first :   winners[0].candidate, second :  winners[1].candidate,third :winners[2].candidate}, function(err,count)
            {
                cbk(err,count);
            });

        },
            /*
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
        */

    ],function(err, result){

    if(err!=null){
        console.log(err);
        if(req.params[0]){
            candidate_page=true;

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
    }

     var        winner_count=  [0,0,0];

    models.QuoteGameGames.find({first: { $exists: true }}, function(err,games)
    {

        _.each(games, function(element, index, list){
            if(element.first==winners[0].candidate) {winner_count[0]++;}
            if(element.first==winners[1].candidate) {winner_count[1]++;}
            if(element.first==winners[2].candidate) {winner_count[2]++;}
        })




     /*

            response.writeHead(302, {
                'Location': 'your/404/path.html'
                //add other headers here...
            });
            response.end();
          */
    models.QuoteGameCandidate.find({ _id:  {$in:[winners[0].candidate,winners[1].candidate, winners[2].candidate]}})
        .populate('party_19th_knesset', { _id: 1, name: 1 , overview:1, wikipedia_link:1,open_knesset_id:1,sandtalk_id:1,platform:1 })
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


            first.candidate_win_ratio= Math.round((100*winner_count[0])/games.length);
            second.candidate_win_ratio= Math.round((100*winner_count[1])/games.length);
            third.candidate_win_ratio= Math.round((100*winner_count[2])/games.length);

            var share_url="uru-staging.herokuapp.com/elections_game/image?first_id="+first._id+"&first_score="+first.score+"&second_id="+second._id+"&second_score="+second.score+"&third_id="+third._id+"&third_score="+third.score;
            var share_url_encoded=encodeURIComponent(share_url);
            var share_query_string="url="+share_url_encoded+"&viewport=880x447";
            var share_token  = md5(share_query_string + req.app.settings.url2png_api_secret)
            var share_img="http://beta.url2png.com/v6/P503113E58ED4A/"+share_token+"/png/?"+share_query_string;
            var share_img_code=first._id+first.score+second._id+second.score+third._id+third.score;
            console.log (share_img);

            var quote_count= (req.session.election_game) ?  _.keys(req.session.election_game).length -1 :0;
            download_file_httpget(share_img,share_img_code,game_code,candidate_page, function(err,image_full_path){

            }) ;
            res.render('elections_game_results.ejs', {
                winners: [first, second,  third],
                second:second,
                third:  third,
                candidate_page:candidate_page,

                share_img:'http://uru.s3.amazonaws.com/eg/'+share_img_code+'.png',
                quotes_count: quote_count ,
                user_logged: req.isAuthenticated()
            });

        })
    }) ;
    });

    var download_file_httpget = function(file_url,image_code,game_code,candidate_page,callback) {
        if(candidate_page)   {
            callback(null,null);
            return;
        }
        models.QuoteGameGames.find({results_code: image_code}, function(err,count)
        {
            if(count.length>0) {
                callback(null,'https://uru.s3.amazonaws.com/eg/'+image_code+'.png');
            }
            else
            {
                var target = 'deliver/public/images/eg/' + image_code + '.png' ;
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
                            console.log( 'download success');
                            var value_full_path = target;
                            stream = fs.createReadStream(target);
                            var knoxClient = require('j-forms').fields.getKnoxClient();
                            var filename = target.substring(target.lastIndexOf('/')+1);
                            knoxClient.putStream(stream, '/eg/'+filename , function(err, res){
                                if(err)  {
                                    callback(err);
                                    console.log( 'amazone upload fail');
                                }
                                else {
                                    var path = res.socket._httpMessage.url;
                                    fs.unlink(value_full_path);
                                    //console.log("res.socket._httpMessage");
                                    //console.log(res.socket._httpMessage);
                                    console.log( 'amazone upload success '+path);
                                    models.QuoteGameGames.update({game_code: game_code}, {results_code: share_img_code}, function(err,count)
                                    {
                                        callback(null,path);
                                    });

                                }
                            });
                        });
                });
            }

        })


    };

    function determineWinners(results){
        var candidates={};
        var max_quotes=0;
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
                        score=5;
                        break;
                    case 'skip':
                        score=0;
                        break;
                    case 'negative':
                        score=-5;
                        break;
                    case 'very_negative':
                        score=-10;
                        break;
                }
                candidates[element.candidate].push(score);
                max_quotes=Math.max(max_quotes,candidates[element.candidate].length)
            }
        } );
        candidates_scors=[];
        _.each(candidates, function(element, index, list){
            var sum=_.reduce(element, function(memo, num){ return memo + num; }, 0);
            var final_score = Math.floor( ((10* sum)/ element.length ) * Math.pow(0.9,(max_quotes-element.length)));
            candidates_scors.push({candidate :index , score:final_score}) ;
        });

        return   _.sortBy(candidates_scors, function(candidate){ return -candidate.score });
    }
};