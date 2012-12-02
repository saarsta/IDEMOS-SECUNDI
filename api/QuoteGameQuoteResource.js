
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
            var ind=    req.body.response;

            models.QuoteGameStatistics.find

            _.indexOf(array, value)

            models.QuoteGameQuote.update(
                {_id:object._id},
                {$inc: { 'response.positive' : 1 } },
                function (err, quote) {
                    callback(err, quote);
            });

        }
    });
