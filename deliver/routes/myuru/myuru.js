var models = require('../../../models');
var async = require('async');
var TokensBarModel= require('./tokensBarModel')

module.exports = function (req, res) {

    var isHisuru=req.params[0]? true: false;
    var userID = isHisuru? req.params[0]: req.session.user._id;
    var user = req.session.user;
    if(isHisuru &&  userID === req.session.user._id){
        isHisuru=false;
    }



    async.waterfall([
        function (cbk) {
            models.User.findById(userID, ["tokens", "num_of_extra_tokens", "proxy", "biography","first_name","last_name","facebook_id", "avatar","score"], function(err, user){
                req.session.user.biography = user.biography;

                cbk(err, user);
            })
        },

        function (user_obj, cbk) {

            //this 5 lines is to know if the if the user is a follower of the "his uru" user
            user_obj.is_follower_of_user = false;
            if(req.session.user && (req.session.user._id + "" != userID + "")){
                if(_.any(user_obj.followers, function(follower){return follower.follower_id + "" == userID + ""}))
                    user_obj.is_follower_of_user = true;
            }

            if(!user_obj.proxy){
                user_obj.proxy = [];
            }
            async.forEach(user_obj.proxy, function (proxy_user, itr_cbk) {
                models.User.findById(proxy_user.user_id, ["_id", "first_name", "last_name", "facebook_id", "avatar","score"], function (err, curr_proxy_user) {
                    if (!err && curr_proxy_user !== null) {
                        curr_proxy_user.avatar = curr_proxy_user.avatar_url();
                        proxy_user.details = curr_proxy_user;
                    }
                    if(curr_proxy_user == null)

                        console.error("curr_proxy_user is null");
                    itr_cbk();
                })
            }, function (err, ocj) {

                //put proxy on curr user -- for his uru
                if(userID != user._id){
                    async.forEach(user.proxy, function (proxy_user, itr_cbk) {
                        models.User.findById(proxy_user.user_id, ["_id", "first_name", "last_name", "facebook_id", "avatar","score"], function (err, curr_proxy_user) {
                            if (!err && curr_proxy_user !== null) {
                                curr_proxy_user.avatar = curr_proxy_user.avatar_url();
                                proxy_user.details = curr_proxy_user;
                            }
                            if(curr_proxy_user == null)
                                console.error("curr_proxy_user is null");
                            itr_cbk();
                        })
                    }, function(err, ocj){
                        cbk(err, user_obj);
                    })
                }else
                    cbk(err, user_obj);
            })
        }

    ], function (err, user_obj) {
        if(!user_obj.proxy)
            console.error("data curruption with user proxies");
        var proxy =  user_obj.proxy || [];

        var num_of_extra_tokens = user_obj.num_of_extra_tokens;
        var tokens =  user_obj.tokens;
        var proxy = user_obj.proxy;
        var tokensBarModel = new TokensBarModel(9, num_of_extra_tokens, tokens, proxy);

        var proxyJson=isHisuru? JSON.stringify(user.proxy):  JSON.stringify(proxy);
        console.log(req.session.avatar_url);
        console.log(user_obj.avatar_url());
        console.log(user_obj);
        res.render('my_uru.ejs',
            {
                layout:false,
                tag_name:req.query.tag_name,
                biographyReadonly:isHisuru,
                title:"אורו שלי",
                logged:req.isAuthenticated(),
                big_impressive_title:"",
                user:user,//current user
                pageUser:user_obj ,///  hisuru user
                avatar:user_obj.avatar_url(),
                curr_user_proxy: user ? user.proxy : null,
                user_logged:req.isAuthenticated(),
                url:req.url,
                tokensBarModel:tokensBarModel,
                tab:'',
		        isHisUru:isHisuru,
                proxy:proxyJson

            });
    })
};

