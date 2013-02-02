var models = require('../../../models')
    ,url = require('url')
    ,common = require('./common');

exports.referred_by_middleware = function(req,res,next)
{
    if('referred_by' in req.query)
    {
        req.session.referred_by = req.query['referred_by'];
        req.session.save(function(err,result)
        {
            next();
        });
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
                        req.session.save(function() {
                            next();
                        });
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

//    if this request needs to be authenticated
    if (common.DONT_NEED_LOGIN_PAGES.some(function(dont) { return dont.test(req.path); })) {
        console.log('skipped auth for %s', req.url)
        next();
        return;
    }

    if (req.isAuthenticated())
    {
        if(!req.session.user || !req.session.avatar_url) {
                models.User.findById(req.session.auth.user._id || req.session.user_id ,function(err,user){
                    if(err){
                        console.log('couldn put user id' + err.message);
                        next();
                    }else{
                        if(user){
                            req.session.user_id = user._id;
                            req.session.avatar_url = user.avatar_url();

                            models.Notification.count({user_id: user._id, seen: false}, function(err, count){
                                if(err){
                                    console.error('error finding user notifications');
                                    user.unseen_notifications = 0;
                                }
                                user.unseen_notifications = count;
                                req.session.save(function(err)
                                {
                                    if(err)
                                        console.log('couldnt put user id' + err.message);
                                    next();
                                });
                            })
                        }
                        else{
                            require('./logout')(req,res);
                        }
                    }
                });
        }
        else
            next();
    }
    else {
        if(_.any(common.REDIRECT_FOR_LOGIN_PAGES,function(redirect_urls)
        {
            return redirect_urls.test(req.path);
        }))
            res.redirect(common.LOGIN_PATH + '?next=' + req.path);
        else
            next();
    }
};
