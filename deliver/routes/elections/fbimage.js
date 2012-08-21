var request = require('request');
var qs = require('querystring');
var models = require('../../../models');
var async = require("async");


module.exports = function(req, res) {
    async.waterfall([
        // get the user by id
        function (cb) {
            models.User.findById(req.params.id, cb)
        },
        // get assosiated discussions
        function (user, cb)
        {
            // we might have some placeholders in this list
            var disc_ids = user.has_voted.filter(function(val) {return val.length > 20;})
            models.Discussion.find({_id: {'$in': disc_ids}}, {title:1, text_field_preview:1}, cb)
        }
    ], function(err, discussion){
        if (err) {
            res.send(500, err);
            return;
        }
        var items = discussion.map(function(dis) {
            return {title: dis.title, text: dis.text_field_preview};
        });
        res.render('fbimage.ejs', {
            layout: false,
            url:req.url,
            items:items
        });
    });
};

