
var common = require('./common')
models = require('../models'),
    async = require('async'),
    _ = require('underscore');;

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
                    var random_results=JSON.parse(JSON.stringify(results));
                    var played_quotes=[];
                    var qoute_by_candidte={}
                    for(var propertyName in req.session.election_game) {
                        played_quotes.push(propertyName);
                    }
                    _.each(results.objects,function(o){
                        if(_.indexOf(played_quotes, o._id)==-1 && o.priority > 0 ) {
                            if( !qoute_by_candidte[o.candidate.id]) {
                                qoute_by_candidte[o.candidate.id]=[];
                            }

                            qoute_by_candidte[o.candidate.id].push(o);
                        }
                    });
                    random_results.objects = shuffle(quoteSelection (qoute_by_candidte,25,(played_quotes.length>=25?false:true)));
                    random_results.meta.total_count=random_results.objects.length;
                    callback(err, random_results);
                }


            });
        }   ,

        update_obj:function (req, object, callback) {
            var response        ='response.'+req.body.response;
            var user_id         =req.body.user_id;
            var quote_id        =req.body.quote_id;
            var game_code       =req.session.election_game.game_code || req.body.hash;
            var candidate_id    =req.body.candidate_id;
            var reset           =req.body.reset;
            // models.InformationItem.update({_id: info_item_id}, {$inc: {like_counter: 1}}, function(err,count)
          //  models.Like.find({user_id: user_id, info_item_id: info_item_id}, cbk);
            if(!req.session.election_game || reset=='true')
            {
                req.session.election_game={};
            }
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
                    models.QuoteGameGames.update({game_code: game_code}, {game_code: game_code}, {upsert: true}, function(err,count)
                    {
                        cbk(err,count);
                    });
                },
                function(result, cbk){

                   // var qu = quote_id+"_"+req.body.response;
                    qu={quote:quote_id ,selection:req.body.response}
                    if(user_id!="") {
                        models.User.update({_id: user_id}, { $set:{ "quote_game.played": true} ,
                                                            $inc:{"quote_game.quotes_count":1} ,
                                                            $addToSet:{"quote_game.quotes" : qu } ,
                                                            $addToSet:{"quote_game.games" : game_code }

                        }, function(err,count)
                        {
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

// secondary candidates
//liberman 50c434f0d18ea20200000030
//ishi      50c468c9a17227020000011b
//benet     50c47ecea172270200000152
//galon     50c4810da172270200000158
//hanin     50c485dba17227020000015f
//gafni     50c45f31a1722702000000fc


    function quoteSelection(quotes_by_candidate,amount,initial){
        var quotes =    [];
        var rest=[];
        if(initial) {
            var  primaryCandidtes = ['50c0968895f1e90200000026','50c430b5d18ea20200000028','50c43377d18ea2020000002c','50c436bfd18ea20200000034']  ;
            var  secondaryCandidtes = ['50c434f0d18ea20200000030','50c468c9a17227020000011b','50c47ecea172270200000152','50c4810da172270200000158','50c485dba17227020000015f','50c45f31a1722702000000fc'] ;
            //grab 3 quotes from each primary candidate
            _.each(primaryCandidtes,function(canditate_id){
                quotes = _.union(quotes,weightedSelection(quotes_by_candidate[canditate_id],3));
            })
            _.each(secondaryCandidtes,function(canditate_id){
                quotes = _.union(quotes,weightedSelection(quotes_by_candidate[canditate_id],2));
            })

            for(var propertyName in quotes_by_candidate) {
                if(_.indexOf(primaryCandidtes,propertyName)==-1 && _.indexOf(secondaryCandidtes,propertyName)==-1 ) {
                    rest = _.union(rest,quotes_by_candidate[propertyName]);
                }
            }
        }  else  {
            for(var propertyName in quotes_by_candidate) {
                    rest = _.union(rest,quotes_by_candidate[propertyName]);
            }
        }

        quotes = _.union(quotes,weightedSelection(rest,Math.min((amount-quotes.length),rest.length)  ));

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
        return ret;
    }

     /*
    function wightedRandomSelection(results,amount){

    var random_results=JSON.parse(JSON.stringify(results));
    random_results.meta.total_count=0;
    random_results.objects=[];


    var weights=[],
        weights_norm=[],
        sum= 0,
        selected_indexes=[];

    for(i=0 ; i<results.meta.total_count ;i++)
    {
        var weight = results.objects[i].priority
        weights.push(weight);
        sum+=weight;
        weights_norm.push(sum);
    }

    for (i=0; i<results.objects.length; i++){
        weights_norm[i] = weights_norm[i]/sum;
    }


    while(random_results.meta.total_count<amount) {
        var i=get_rand(weights_norm) ;
        if (_.indexOf(selected_indexes, i) ==-1)
        {
            selected_indexes.push(i);
            random_results.objects.push(results.objects[i])  ;
            random_results.meta.total_count++;
        }
    }
    return random_results;



}
     */

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
