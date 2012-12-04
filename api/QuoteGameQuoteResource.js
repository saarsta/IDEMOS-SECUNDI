
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
                return query.populate('candidate').sort({priority: 'descending'});
            };
        }    ,

        get_objects:function (req, filters, sorts, limit, offset, callback) {

            this._super(req, filters, sorts, limit, offset, function (err, results) {

                if(err) {
                    callback(err);
                }

                else {
                    var random_results=JSON.parse(JSON.stringify(results));
                    random_results.meta.total_count=0;
                    random_results.objects=[];
                    for(i=0 ; i<30 && i<results.meta.total_count ;i++)
                    {
                        var ind = Math.floor(Math.random() * results.objects.length);
                        random_results.objects.push(results.objects[ind])  ;
                        random_results.meta.total_count++;
                        results.objects.splice(ind,1);
                    }
                    callback(err, random_results);
                }


            });
        }   ,

        update_obj:function (req, object, callback) {
            var res=    req.body.response;
            var user_id   =req.body.user_id;
            var quote_id   =req.body.quote_id;
            var hash_code   =req.body.hash;
            // models.InformationItem.update({_id: info_item_id}, {$inc: {like_counter: 1}}, function(err,count)
          //  models.Like.find({user_id: user_id, info_item_id: info_item_id}, cbk);
            async.waterfall([

                function(cbk){
                    models.QuoteGameHashes.update({hash: hash_code}, {$set:{hash: hash_code}},  { upsert: true }).exec( function(err,count)
                    {
                        cbk(err,count);
                    });
                },
                function(result, cbk){
                    if(user_id!="") {
                        models.Users.update({_id: user_id}, { $set:{ "quote_game.played": true} , $inc:{"quote_game.qoutes_count":1}} ,cbk);
                     } else {
                        cbk()
                    }

                },

                function(result, cbk){
                    models.QuoteGameQuote.update(  {_id:object._id},   {$inc: { 'response.positive' : 1 } }, cbk);
                }
            ],function(err, result){
                callback(err, quote);
            });

           // models.QuoteGameQuote.update({_id: quote_id}, {$inc:{"response.res":1}} );
            //_.indexOf(array, value)

        }
    });
