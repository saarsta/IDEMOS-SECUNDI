var request = require('request');
var qs = require('querystring');
var models = require('../../../models');
var async = require("async");


module.exports = function(req, res) {
    getUserChosenDiscussions(req, req.params.id, function(err, items){
        if (err) {
            res.send(500, err);
            return;
        }
        res.render('fbimage.ejs', {
            layout: false,
            url: req.url,
            items: items.map(function(dis) { return {title: dis.title, text: dis.text_field_preview}; })
        });
    })
};


var getUserChosenDiscussions = module.exports.getUserChosenDiscussions = function(req, user_id, callback) {
    async.waterfall([
        // get the user by id
        function (cb) {
            models.User.findById(user_id, cb)
        },
        // get assosiated discussions
        function (user, cb)
        {
            // we might have some placeholders in this list
            var disc_ids = user.has_voted.filter(function(val) {return val.length > 20;});
            models.Discussion.find({_id: {'$in': disc_ids}}, function(err, result){
                cb(err, result)
            })
        }
    ], callback
    );
};

