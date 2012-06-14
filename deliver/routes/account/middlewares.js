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
            //for now this only works for facebook connect
            //        req.session.user_id  = req.session.auth.user.id || req.session.auth.user_id;
            models.User.findOne(/*req.session.user_id*/{facebook_id: req.session.auth.user.id} ,function(err,user){
                if(err){
                    console.log('couldn put user id' + err.message)
                    next();
                }else{
                    req.session.user_id = user._id;
                    req.session.user = user;
                    req.session.avatar_url = user.avatar_url();
                    req.session.save(function(err)
                    {
                        if(err)
                            console.log('couldnt put user id' + err.message);
                        next();
                    });
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
            res.redirect(LOGIN_PATH + '?next=' + req.path);
        else
            next();
    }
};