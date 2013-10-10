var models = require('../../models')
    ,url = require('url')
    ,common = require('./common')
    ,logout_handler = require('./logout');

exports.referred_by_middleware = function(req,res,next)
{
    if('referred_by' in req.query)
    {
        req.session.referred_by = req.query['referred_by'];
        next();
    }
    else
    {
        if('fb_action_ids' in req.query) {
            models.FBRequest.findOne().where('fb_request_ids',req.query['fb_action_ids']).exec(function(err,obj) {
                if(err) {
                    console.error('couldn\'t failed getting link from obj');
                    console.error(err);
                    next();
                }
                else {
                    if(obj && obj.creator) {
                        var link = obj.link;

                        var parsed_link = url.parse(link);
                        if(parsed_link.path != req.path) {
                            res.redirect(link);
                            return;
                        }

                        req.session.referred_by = obj.creator + '';
                        next();
                    }
                    else {
                        console.error('couldn\'t find fb_request_id ');
                        next();
                    }
                }

            });
        }
        else
            next();
    }
};


exports.auth_middleware = function (req, res, next) {
    function isInArr(element, index, array) {
        return (req.path.search(element) >= 0);
    }

    if (req.isAuthenticated())
        return next();

    if (isInArr("mail_settings")) return res.redirect(common.LOGIN_PATH + '?next=' + req.path);

    // todo this always return true (search fails returns with -1)
    if (common.DONT_NEED_LOGIN_PAGES.some(req.path.search, req.path)) {
        req.no_need_auth = true;
        console.log('skipped auth for %s', req.url);
        return next();
    }

    if (common.REDIRECT_FOR_LOGIN_PAGES.some(req.path.search, req.path)) {
        return res.redirect(common.LOGIN_PATH + '?next=' + req.path);
    }

    return null;
};


exports.populate_user = function (req, res, next) {
    var user_id = req.session.user_id || (req.session.auth && req.session.auth.user && req.session.auth.user._id);
    models.User.findById(user_id, function (err, user) {
        if (err) throw err;
        if (!user) {
            if (req.no_need_auth)
                next();
            else
                logout_handler(req, res);
            return;
        }
        req.user = user;
        req.session.user = user;
        req.session.user_id = user._id;
        req.session.avatar_url = user.avatar_url();
        models.Notification.count({user_id: user_id, seen: false}, function (err, count) {
            if (err) {
                console.error('error finding user notifications');
                count = 0;
            }
            user.unseen_notifications = count;
            next();
        })
    });
};
