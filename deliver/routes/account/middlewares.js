var models = require('../../../models')
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
        next();
};

exports.auth_middleware = function (req, res, next) {

//    if this request needs to be authenticated
    if(_.any(common.DONT_NEED_LOGIN_PAGES,function(dont)
    {
        return dont.test(req.path);
    }))
    {
        next();
        return;
    }

    if (req.isAuthenticated())
    {
        if(!req.session.user) {
                models.User.findById(req.session.auth.user._id || req.session.user_id ,function(err,user){
                    if(err){
                        console.log('couldn put user id' + err.message);
                        next();
                    }else{
                        if(user){
                            req.session.user_id = user._id;
                            req.session.avatar_url = user.avatar_url();

                            models.Notification.count({user_id: user._id}, function(err, count){
                                if(err){
                                    console.error('error finding user notifications');
                                    user.unseen_notifications = 0;
                                }
                                user.unseen_notifications = count;
                                req.session.user = user;
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
                            next()
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