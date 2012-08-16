var request = require('request');
var qs = require('querystring');
var models = require('../../../models');


function updateUserHasVoted(req, user_id, callback) {
    models.User.findOne({_id: user_id}, function(err, user) {
        if (err) {
            return callback(err);
        }
        user.has_voted = true;
        user.save(function (err, user) {
            if (err) {
                console.error(err);
                callback(err);
            } else {
                req.session.user = user;
                req.session.save(function(err){
                    if (err) {
                        console.error(err);
                        callback(err);
                    } else {
                        callback(null, user.id);
                    }
                })
            }
        });
    });
}

module.exports = function(req, res) {
    if (req.session.user && req.session.user.has_voted)
        res.json(403 , "has_voted");
    else{
        // Two lines of google voodoo
        req.body.backupCache = '';
        req.body.submit = 'Submit';
        // Record the user's IP
        req.body['entry.39.single'] = ('x-forwarded-for' in req.headers) ? req.headers['x-forwarded-for'] : req.connection.remoteAddress;
        // e-mail
        req.body['entry.40.single'] = req.session.user ? req.session.user.email : "";


        var vote_data = qs.stringify(req.body);
        var post_opts = {
            uri: 'https://docs.google.com/spreadsheet/formResponse?formkey=dDI5dUg1TFMzUENKc09lSXp5aTh2alE6MQ&ifq',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            body: vote_data
        };
        request.post(post_opts, function(err, resp, body) {
            if (err) {
                console.error(err);
                res.json("ok");
            }
            else {

                updateUserHasVoted(req, req.session.user._id, function(err) {
                    if(err) {
                        console.error(err);
                    }
                    if(req.session.delete == true){
                        req.session.user = null;
                        req.session.save(function(err, results){
                            res.json("ok");
                        })
                    }else
                        res.json("ok");
                });
            }
        });
    }

};

