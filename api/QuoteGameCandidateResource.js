
var common = require('./common')
models = require('../models'),
    async = require('async');

var QuoteGameCandidateResource = module.exports = jest.MongooseResource.extend(
    {
        init:function () {
            this._super(models.QuoteGameCandidate, null, null);
            this.allowed_methods = ['get'];
            this.default_query = function (query) {
                return query.populate('party_19th_knesset');
            };

        },
        get_objects:function (req, filters, sorts, limit, offset, callback) {

            this._super(req, filters, sorts, limit, offset, function (err, results) {

                var also_liked= {},
                    also_liked_arr= [];
                if(err) {
                    callback(err);
                } else {
                    models.QuoteGameGames.find({first: { $exists: true }}, function(err,games) {
                        _.each(games, function(element, index, list){
                            if(element.first==winners[0].candidate)
                            {
                                if(!also_liked[element.second]){
                                    also_liked[element.second]=0;
                                }
                                if(!also_liked[element.third]){
                                    also_liked[element.third]=0;
                                }
                                also_liked[element.third]++;
                                also_liked[element.second]+=2;
                            }
                        })
                        _.each(also_liked, function(element, index, list){
                            also_liked_arr.push({id:index , count:element })
                        })
                        also_liked_arr=_.sortBy(also_liked_arr, function(candidate){
                            return  -candidate.count;
                        });
                        callback(results);
                    });
                }


            });
        }

    });
