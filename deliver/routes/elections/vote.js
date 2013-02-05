var request = require('request');
var qs = require('querystring');
var models = require('../../../models');
var async = require('async');
var util = require('util');

var discussion_google_to_objid = function(value, idx, collection) {
    return discussion_google_to_objid.mapping[value];
};
discussion_google_to_objid.mapping = {
    'entry.6.group':  '50312d145bb1360200000065', // חינוך טוב יותר
    'entry.7.group':  '502cefe6abfc52020000002a',
    'entry.25.group': '502117271aff910200000c14',
    'entry.23.group': '503b992b7ccaa302000000e8', // הוזלת הדיור
    'entry.21.group': '503a5b84bd50520200000017', // שיפור תנאים
    'entry.19.group': '5022def369668c0200020d1e',
    'entry.17.group': 'מאבק בעבריינות: תוחמר האכיפה ומדיניות הענישה על עבירות גוף ורכוש', // מאבק בעבריינות
    'entry.15.group': 'יותר שוטרים ברחוב: יועלו משמעותית מספר השוטרים, תגמולם והכשרתם', // יותר שוטרים ברחוב
    'entry.13.group': '5023af9b61a325020000efbe',
    'entry.11.group': '501e69e17555f60200001f2e',
    'entry.9.group':  '502a91a90893a502000000ce',
    'entry.31.group': '5030eaf0e840450200000412',
    'entry.33.group': '4ff436ba47d7fa010000071f',
    'entry.35.group': '4fcdf7180a381201000005b3'
};


module.exports = function(req, res) {
    var user = req.session.user;
    if (!user) {
        res.json(403 , "not_loged_in");
        return;
    }
    if (user.has_voted && user.has_voted.length) {
        res.json(403 , "has_voted");
        return;
    }
    // Two lines of google voodoo
    req.body.backupCache = '';
    req.body.submit = 'Submit';
    // Record the user's IP
    req.body['entry.39.single'] = ('x-forwarded-for' in req.headers) ? req.headers['x-forwarded-for'] : req.connection.remoteAddress;
    // e-mail
    req.body['entry.40.single'] = user.email || "";
    // e-mail
    req.body['entry.41.group'] = user.facebook_id ? "X" : "";
    // e-mail
    req.body['entry.43.single'] = util.format("%s %s", user.first_name, user.last_name);

    var vote_data = qs.stringify(req.body);
    var form_key = (req.app.settings.env == 'production') ? 'dDI5dUg1TFMzUENKc09lSXp5aTh2alE6MQ' : 'dHF0a0hVZmMtSWJYRUNrdkx0VnZBV0E6MA';

    async.series([
        // send post to google
        function(cbk) {
            request.post({
                uri:  util.format('https://docs.google.com/spreadsheet/formResponse?formkey=%s&ifq', form_key),
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                method: 'POST',
                body: vote_data
            },
            cbk);
        },
        // mark voting on user
        function (cbk) {
            // this is for mongoose compatibility (breaks when nested obj has '.' in name)
            var discussion_ids = Object.keys(req.body).map(discussion_google_to_objid).filter(function(x){return x});
            if ('entry.37.single' in req.body)
                discussion_ids.push(req.body['entry.37.single']);
            models.User.findByIdAndUpdate(user._id, {has_voted: discussion_ids}, cbk);
        },
        // delete user from session to trigger reload of the user object or logout
        function(cbk) {
            if(req.session.delete) {
                req.logout(cbk)
            } else {
                delete req.session.user;
            }
        }],
        // respond
        function(err) {
            if (err){
                res.statusCode = 500;
            }
            res.json(err || user._id)
        }
    );
};

