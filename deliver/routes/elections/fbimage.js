var request = require('request');
var qs = require('querystring');
var models = require('../../../models');
var async = require("async");
var createHash = require('crypto').createHash;
var util = require('util');

var url2png = function (req, url, viewport, fullpage, thumbnail_max_width) {
    var apikey = req.app.settings.url2png_api_key,
        secret = req.app.settings.url2png_api_secret,
        target = util.format('url=%s&viewport=%s&fullpage=%s&thumbnail_max_width=%s&force=true',
            encodeURIComponent(url),
            viewport,
            fullpage ? 'true' : 'false',
            thumbnail_max_width
        ),
        token = createHash('md5').update(target + secret).digest('hex');
    return util.format('http://beta.url2png.com/v6/%s/%s/png/?%s',
        apikey,
        token,
        target
    );
};

module.exports = function(req, res) {
    if (req.method =='POST') {
        var target_url = url2png(req, 'http://uru-staging.herokuapp.com' + req.path, '830x830', true, 830);
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
            items: items.map(function(dis) {
                var textParts = dis.title.split(':', 2);
                return {title: textParts[0], text: textParts[1]};
            })
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

