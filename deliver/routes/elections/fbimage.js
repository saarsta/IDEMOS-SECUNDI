var request = require('request');
var qs = require('querystring');
var models = require('../../../models');
var async = require("async");
var createHash = require('crypto').createHash;
var util = require('util');


module.exports = function(req, res) {
    if (req.method =='POST') {
        var users_fbimage_url = 'http://www.uru.org.il' + req.path;
        var md5 = createHash('md5');
        md5.update(req.app.settings.url2png_api_secret);
        md5.update('+');
        md5.update(users_fbimage_url);
        var security_hash = md5.digest('hex');
        var target_url = util.format('http://api.url2png.com/v3/%s/%s/%s/%s',
            req.app.settings.url2png_api_key,
            security_hash,
            '500x500',
            users_fbimage_url
        );
        res.send({target_url: target_url});
        return;
    }

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
            var conditions = (user_id.length == 24) ? {_id: user_id} : {facebook_id:user_id};
            models.User.findOne(conditions, cb)
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

