var request = require('request');
var qs = require('querystring');
var models = require('../../../models');
var async = require("async");
var createHash = require('crypto').createHash;
var util = require('util');

var url2png = function (req, url, viewport, fullpage, thumbnail_max_width) {
    var apikey = req.app.settings['url2png_api_key'],
        secret = req.app.settings['url2png_api_secret'],
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
        var path = 'http://uru-staging.herokuapp.com/elections/fbimage/' + req.session.user.id;
        var target_url = url2png(req, path, '750x750', true, 750);
        res.send({target_url: target_url});
        return;
    }

    getUserChosenDiscussions(req, req.params.id, function(err, items){
        if (err) {
            items = [];
        }
        res.render('fbimage.ejs', {
            layout: false,
            url: req.url,
            items: items.map(function(dis) {
                var textParts = dis.title.split(':', 2);
                return {title: textParts[0], text: textParts[1] || ''};
            })
        });
    })
};

var subject_map = {
    '6':  '50312d145bb1360200000065', // חינוך טוב יותר
    '7':  '502cefe6abfc52020000002a',
    '25': '502117271aff910200000c14',
    '23': '503b992b7ccaa302000000e8', // הוזלת הדיור
    '21': '503a5b84bd50520200000017', // שיפור תנאים
    '19': '5022def369668c0200020d1e',
    '17': 'מאבק בעבריינות: תוחמר האכיפה ומדיניות הענישה על עבירות גוף ורכוש', // מאבק בעבריינות
    '15': 'יותר שוטרים ברחוב: יועלו משמעותית מספר השוטרים, תגמולם והכשרתם', // יותר שוטרים ברחוב
    '13': '5023af9b61a325020000efbe',
    '11': '501e69e17555f60200001f2e',
    '9':  '502a91a90893a502000000ce',
    '31': '5030eaf0e840450200000412',
    '33': '4ff436ba47d7fa010000071f',
    '35': '4fcdf7180a381201000005b3'
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
            user = user || {has_voted:[]};
            // we might have some placeholders in this list
            var votes = user.has_voted.map(function(val) { return subject_map[val] || val;});
            var disc_ids = votes.filter(function(val) {return val.length == 24 && parseInt(val, 16);});
            var stored_disc = votes.filter(function(val) {return !parseInt(val, 16);}).map(function(val) {return {title:val};});
            models.Discussion.find({_id: {'$in': disc_ids}}, function(err, result){
                if (err) {
                    cb(err);
                } else {

                    //set post_count for each discussion
                    async.forEach(result, function(obj, itr_cbk){
                        models.Post.count({discussion_id: obj._id}, function(err, count){
                            if(err){
                                itr_cbk(err);
                            }else{
                                //TODO grade_sum == post_count cause mongoode dont allow me to add a field!!
                                obj.grade_sum = count;
                                itr_cbk(err, obj);
                            }
                        })
                    }, function(err, objs){
                        cb(null, result.concat(stored_disc));
                    })
                }
            })
        }
        ],

        callback
    );
};

