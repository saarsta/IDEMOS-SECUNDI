
var common = require('./common')
models = require('../models'),
    async = require('async'),
    mongoose = require('mongoose'),
    _ = require('underscore');



var QuoteGameQuoteResource = module.exports = jest.MongooseResource.extend(
    {
        req_g: {},
        init:function () {
            this._super(models.QuoteGameQuote, null, null);
            this.allowed_methods = ['get','put'];
            //this.authentication = new common.SessionAuthentication();
            //this.filtering = {cycle: null};
            this.default_query = function (query) {

                return query
                    .populate('candidate');

            };
        }    ,

        get_objects:function (req, filters, sorts, limit, offset, callback) {

            this._super(req, filters, sorts, limit, offset, function (err, results) {

                if(err) {
                    callback(err);
                }
                else {
                   
                    var final_results=JSON.parse(JSON.stringify(results));
                    var played_quotes=[];
                    var skipped_quotes=0;
                    var qoute_by_candidte={}  ;
                    var reset           =req.query.reset;
                    var candidate_id           =req.query.candidate_id;

                    if(!req.session.election_game || reset=='true')
                    {
                        req.session.election_game={};
                        callback(err, {});
                    }

                    if(candidate_id){
                        final_results.objects=[];
                        _.each(results.objects,function(o){
                            if(o.candidate.id==candidate_id)  {
                                o._doc['voted'] =  req.session.election_game[o.id] || null;
                                final_results.objects.push(o);
                            }
                        });
                        final_results.meta.total_count=final_results.objects.length;
                    }else{
                        for(var propertyName in req.session.election_game) {

                            played_quotes.push(propertyName);
                            if(
                                req.session.election_game[propertyName].response &&
                                req.session.election_game[propertyName].response=="skip"

                                ){
                                skipped_quotes++;
                            }
                        }
                        _.each(results.objects,function(o){
                            if(_.indexOf(played_quotes, o.id)==-1 && o.priority > 0 ) {
                                if( !qoute_by_candidte[o.candidate.id]) {
                                    qoute_by_candidte[o.candidate.id]=[];
                                }

                                qoute_by_candidte[o.candidate.id].push(o);
                            }
                            else{
                               // console.log(o._id);
                            }
                        });

                        final_results.objects = shuffle(quoteSelection (qoute_by_candidte,25,(played_quotes.length>=25?false:true)));
                        final_results.meta.total_count=final_results.objects.length;
                        final_results.meta.played_quotes=Math.max(played_quotes.length -1 -skipped_quotes,0);

                    }
                    callback(err, final_results);
                }


            });
        }   ,

        update_obj:function (req, object, callback) {
            var response        ='response.'+req.body.response;
            var user_id         =req.body.user_id;
            var quote_id        =req.body.quote_id;
            var game_code       = req.body.hash;
            var candidate_id    =req.body.candidate_id;

            game_code =(req.session.election_game && req.session.election_game.game_code) ?  req.session.election_game.game_code :game_code;

            // models.InformationItem.update({_id: info_item_id}, {$inc: {like_counter: 1}}, function(err,count)
          //  models.Like.find({user_id: user_id, info_item_id: info_item_id}, cbk);

            req.session.election_game.game_code=game_code;
            req.session.election_game[quote_id]={candidate:candidate_id,response: req.body.response};
            req.session.save(function(calee,length){
                var played_quotes=[];
                for(var propertyName in req.session.election_game) {
                    played_quotes.push(propertyName);
                }
               console.log("session saved " +played_quotes.length);
            });
            async.waterfall([
                function(cbk){
                    var now= Date.now()
                    models.QuoteGameGames.update({game_code: game_code}, {  $set:{ game_code: game_code , updated :now }, $inc:{"quote_count":1} }, {upsert: true}, function(err,count)
                    {
                        cbk(err,count);
                    });
                },
                function(result, cbk){
                    qu={quote:quote_id ,selection:req.body.response}
                    if(user_id!="") {
                        models.User.update({_id: user_id}, {
                            $set:       { "quote_game.played": true} ,
                            $inc:       {"quote_game.quotes_count":1} ,
                            $addToSet:  {"quote_game.quotes" : qu } ,
                            $addToSet:  {"quote_game.games" : game_code }
                        }, function(err,count)  {
                            console.log(err);
                            cbk(err,count);
                        });
                     } else {
                        cbk(null,null)
                    }

                },
                function(result, cbk){
                    var  re={};
                    re[response]=1;
                    models.QuoteGameQuote.update(  {_id:object._id},   {$inc: re }, function(err,count)
                    {
                        cbk(err,count);
                    });
                }
               /*  ,function(result, cbk){
                    var played_quotes=[];

                    for(var propertyName in req.session.election_game) {
                        played_quotes.push(propertyName);
                    }
                    callback(err, played_quotes);

                } */
            ],function(err, result){
                console.log('end');
                var played_quotes=[];

                for(var propertyName in req.session.election_game) {
                    played_quotes.push(propertyName);
                }
                callback(err, played_quotes);
            });

           // models.QuoteGameQuote.update({_id: quote_id}, {$inc:{"response.res":1}} );
            //_.indexOf(array, value)

        }

    });



    //primary candidates :
//  shelli  50c0968895f1e90200000026
//  bibi    50c430b5d18ea20200000028
//  yair    50c43377d18ea2020000002c
//  livni   50c436bfd18ea20200000034
//  liberman 50c434f0d18ea20200000030
//  benet     50c47ecea172270200000152

// secondary candidates

//ishi      50c468c9a17227020000011b
//galon     50c4810da172270200000158
//barake    50c47b3ba17227020000014e
//litzman   50ca2e6f607aa2020000008f
//shtinitz  50c45f7ea172270200000100

/// anocdotal

//zhalke    50c46c16a172270200000125
    function quoteSelection(quotes_by_candidate,amount,initial){
        var quotes =    [];
        var rest=[];
        if(initial) {
            var  primaryCandidtes =   ['50c0968895f1e90200000026','50c430b5d18ea20200000028','50c43377d18ea2020000002c','50c436bfd18ea20200000034','50c434f0d18ea20200000030','50c47ecea172270200000152']  ;
            var  secondaryCandidtes = ['50c468c9a17227020000011b','50c47ecea172270200000152','50c4810da172270200000158','50ca2e6f607aa2020000008f','50c47b3ba17227020000014e','50c45f7ea172270200000100'] ;
            //grab 3 quotes from each primary candidate
            _.each(primaryCandidtes,function(canditate_id){
                var selected_qoutes=weightedSelection(quotes_by_candidate[canditate_id],2) ;
                quotes = _.union(quotes,selected_qoutes.quotes);
                for (var i=selected_qoutes.indexs.length-1;i>=0;i--)
                {
                    quotes_by_candidate[canditate_id].splice(selected_qoutes.indexs[i],1);
                }

            })
            _.each(secondaryCandidtes,function(canditate_id){
                var selected_qoutes=weightedSelection(quotes_by_candidate[canditate_id],1);
                quotes = _.union(quotes,selected_qoutes.quotes);
                for (var i=selected_qoutes.indexs.length-1;i>=0;i--)
                {
                    quotes_by_candidate[canditate_id].splice(selected_qoutes.indexs[i],1);
                }
            })

        }

        for(var propertyName in quotes_by_candidate) {
            rest = _.union(rest,quotes_by_candidate[propertyName]);
        }
        var selected_qoutes=weightedSelection(rest,Math.min((amount-quotes.length),rest.length))
        quotes = _.union(quotes,selected_qoutes.quotes);

        return quotes;
    }


    function weightedSelection(qoutes,amount){

        var ret=[],
            weights=[],
            weights_norm=[],
            sum= 0,
            selected_indexes=[];

        for(i=0 ; i<qoutes.length ;i++)
        {
            var weight = qoutes[i].priority
            weights.push(weight);
            sum+=weight;
            weights_norm.push(sum);
        }

        for (i=0; i<qoutes.length; i++){
            weights_norm[i] = weights_norm[i]/sum;
        }


        while(ret.length< Math.min(amount,qoutes.length)) {
            var i=get_rand(weights_norm) ;
            if (_.indexOf(selected_indexes, i) ==-1)
            {
                selected_indexes.push(i);
                ret.push(qoutes[i])  ;

            }
        }
        return {quotes:ret,indexs:selected_indexes};
    }


function get_rand(weights_norm){
    needle = Math.random();
    high = weights_norm.length - 1;
    low = 0;

    while(low < high){
        probe = Math.ceil((high+low)/2);

        if(weights_norm[probe] < needle){
            low = probe + 1;
        }else if(weights_norm[probe] > needle){
            high = probe - 1;
        }else{
            return probe;
        }
    }

    if(low != high ){
        return (weights_norm[low] >= needle) ? low : probe;
    }else{
        return (weights_norm[low] >= needle) ? low : low + 1;
    }
}

function shuffle (o){ //v1.0
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
