var request = require('request');
var qs = require('querystring');
var models = require('../../../models');
var async = require("async");


module.exports = function(req, res) {

    var data = {};
    data.user_id = req.params.id;

    getUserChosenDiscussions(req, data, function(err, items){
        if (err) {
            res.send(500, err);
            return;
        }

        res.render('fbimage.ejs', {
            layout: false,
            url:req.url,
            items:items
        });
    })
};

var getUserChosenDiscussions = module.exports.getUserChosenDiscussions = function(req, data, callback) {
    async.waterfall([
        // get the user by id
        function (cb) {
            models.User.findById(data.user_id, cb)
        },
        // get assosiated discussions
        function (user, cb)
        {
            // we might have some placeholders in this list
            var disc_ids = user.has_voted.filter(function(val) {return val.length > 20;});
            models.Discussion.find({_id: {'$in': disc_ids}}, cb)
        }
    ], function(err, discussions){
        if(!err)

        callback(err, discussions);
    });
}

