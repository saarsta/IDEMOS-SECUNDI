
var common = require('./common')
models = require('../models'),
    async = require('async'),
    _ = require('underscore');;

var QuoteGameQuoteResource = module.exports = jest.MongooseResource.extend(
    {
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
                    random_results=wightedRandomSelection(results,30);
                    callback(err, random_results);
                }


            });
        }   ,

        update_obj:function (req, object, callback) {
            var response=    'response.'+req.body.response;
            var user_id   =req.body.user_id;
            var quote_id   =req.body.quote_id;
            var hash_code   =req.body.hash;
            // models.InformationItem.update({_id: info_item_id}, {$inc: {like_counter: 1}}, function(err,count)
          //  models.Like.find({user_id: user_id, info_item_id: info_item_id}, cbk);
            if(!req.session.election_game)
            {
                req.session.election_game={};
            }
            req.session.election_game.quote_id=response;
            async.waterfall([
                function(cbk){
                    models.QuoteGameHashes.update({hash: hash_code}, {hash: hash_code}, {upsert: true}, function(err,count)
                    {
                        cbk(err,count);
                    });
                },
                function(result, cbk){
                    if(user_id!="") {
                        models.User.update({_id: user_id}, { $set:{ "quote_game.played": true} ,
                                                            $inc:{"quote_game.qoutes_count":1} ,
                                                            $push:{quote: quote_id ,selection: response} }, function(err,count)
                        {
                            cbk(err,count);
                        });
                     } else {
                        cbk()
                    }

                },
                function(result, cbk){
                    models.QuoteGameQuote.update(  {_id:object._id},   {$inc: { response : 1 } }, cbk);
                }
            ],function(err, result){
                callback(err, ""/*quote*/);
            });

           // models.QuoteGameQuote.update({_id: quote_id}, {$inc:{"response.res":1}} );
            //_.indexOf(array, value)

        }

    });


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
        var i=get_rand() ;
        if (_.indexOf(selected_indexes, i) ==-1)
        {
            selected_indexes.push(i);
            random_results.objects.push(results.objects[i])  ;
            random_results.meta.total_count++;
        }
    }
    return random_results;
    /*
     for(i=0 ; i<30 && i<results.meta.total_count ;i++)
     {
     var ind = Math.floor(Math.random() * results.objects.length);
     random_results.objects.push(results.objects[ind])  ;
     random_results.meta.total_count++;
     results.objects.splice(ind,1);
     }
     */

    function get_rand(){
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

}