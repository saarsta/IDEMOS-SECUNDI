var request = require('request');
var qs = require('querystring');

module.exports = function(req, res) {
    // Two lines of google voodoo
    req.body.backupCache = '';
    req.body.submit = 'Submit';
    // Record the user's IP
    req.body['entry.39.single'] = ('x-forwarded-for' in req.headers) ? req.headers['x-forwarded-for'] : req.connection.remoteAddress;

    var vote_data = qs.stringify(req.body);
	var post_opts = {
        uri: 'https://docs.google.com/spreadsheet/formResponse?formkey=dDI5dUg1TFMzUENKc09lSXp5aTh2alE6MQ&ifq',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        body: vote_data
    };
    var post_req = request.post(post_opts, function(err, resp, body) {
        res.json("ok");
    });
};

