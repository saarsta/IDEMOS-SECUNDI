var models = require('../../../models');
var async = require('async');
var TokensBarModel= require('./tokensBarModel')

module.exports = function (req, res) {

    var isHisuru=req.params[0]? true: false;
    var pageUserID = isHisuru? req.params[0]: req.session.user._id;
    var sessionUser = req.session.user;
    var curr_user_db;

    if(isHisuru &&  pageUserID === req.session.user._id){
        isHisuru=false;
    }

    /*
        async
        1
            1.1 get details of my/his uru user
            1.2 in case that we are on "his uru" situation and we are loged in -  get details of current user
            1.3 if 1.2 situation, check if user is a follower of his uru

        2  avner sets things for himself

     */
    // TODO get both users on same query

    async.waterfall([
        //1
        function(cbk){
            async.parallel([
                //1.1
                function (cbk1) {
                    //get details of my/his uru user
                    models.User.findById(pageUserID)
                        .select(["tokens", "num_of_extra_tokens","proxy" , "biography","first_name","last_name","facebook_id", "avatar","score"])
                        .populate("proxy.user_id",['id','_id','first_name','last_name','avatar_url','facebook_id'])
                        .exec(function(err, user){
                            req.session.user.biography = user.biography;
                            cbk1(err, user);
                        })
                },

                //1.2
                function(cbk1){
                    //get details of the current user that watch "his uru"
                    if(sessionUser && pageUserID != sessionUser._id){
                        models.User.findById(sessionUser._id)
                            .select(["tokens", "num_of_extra_tokens", "proxy", "biography","first_name","last_name","facebook_id", "avatar","score"])
                            .populate("proxy.user_id",['id','_id','first_name','last_name','avatar_url','facebook_id'])
                            .exec(function(err, user){
                                cbk1(err, user);
                            });
                    }else{
                        cbk1(null, null);
                    }
                }

            ], function(err, args){
                //1.3
                var my_or_his_uru_user = args[0];

                //put proxy populated details in proxy.details, so avner wont fill the change
                _.each(my_or_his_uru_user.proxy, function(proxy){proxy.details = proxy.user_id});
                curr_user_db = args[1];

                if(curr_user_db){
                    //put proxy populated details in proxy.details, so avner wont fill the change
                    _.each(curr_user_db.proxy, function(proxy){proxy.details = proxy.user_id});
                    //find if the user is a follower of the "his uru" user
                    curr_user_db.is_follower_of_user = false;
                    if(_.any(curr_user_db.followers, function(follower){ return follower.follower_id + "" == pageUserID + ""})){
                        curr_user_db.is_follower_of_user = true;
                     }
                    }
                cbk(err, my_or_his_uru_user);
            })
        }

    ], function (err, user_obj) {
        //2
        if(!user_obj.proxy)
            console.error("data curruption with user proxies");
        var proxy =  user_obj.proxy || [];

        var num_of_extra_tokens = user_obj.num_of_extra_tokens;
        var tokens =  user_obj.tokens;
      //  var proxy = user_obj.proxy;
        var tokensBarModel = new TokensBarModel(9, num_of_extra_tokens, tokens, proxy);

        var proxyJson=isHisuru? JSON.stringify(sessionUser.proxy):  JSON.stringify(proxy);

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
                user:sessionUser,//current user
                pageUser:user_obj ,///  hisuru user
                avatar:user_obj.avatar_url(),
                curr_user_proxy: curr_user_db ? curr_user_db.proxy : null,
                user_logged:req.isAuthenticated(),
                url:req.url,
                tokensBarModel:tokensBarModel,
                tab:'',
		        isHisUru:isHisuru,
                proxy:proxyJson
            });
    })
};



//        function (user_obj, cbk) {
//
////            if(!user_obj.proxy){
////                user_obj.proxy = [];
////            }
//
//
////            async.forEach(user_obj.proxy, function (proxy_user, itr_cbk) {
////                models.User.findById(proxy_user.user_id, ["_id", "first_name", "last_name", "facebook_id", "avatar","score"], function (err, curr_proxy_user) {
////                    if (!err && curr_proxy_user !== null) {
////                        curr_proxy_user.avatar = curr_proxy_user.avatar_url();
////                        proxy_user.details = curr_proxy_user;
////                    }
////                    if(curr_proxy_user == null)
////
////                        console.error("curr_proxy_user is null");
////                    itr_cbk();
////                })
////            }, function (err, ocj) {
////
////                //put proxy on curr user -- for his uru
////                if(userID != user._id){
////                    models.User.findById(user._id, function(err, user){
////                        if(err || !user)
////                            cbk(err, user_obj);
////                        else{
////                            curr_user = user;
////                            async.forEach(curr_user.proxy, function (proxy_user, itr_cbk) {
////                                models.User.findById(proxy_user.user_id, ["_id", "first_name", "last_name", "facebook_id", "avatar","score"], function (err, curr_proxy_user) {
////                                    if (!err && curr_proxy_user !== null) {
////                                        curr_proxy_user.avatar = curr_proxy_user.avatar_url();
////                                        proxy_user.details = curr_proxy_user;
////                                    }
////                                    if(curr_proxy_user == null)
////                                        console.error("curr_proxy_user is null");
////                                    itr_cbk();
////                                })
////                            }, function(err, ocj){
////                                cbk(err, user_obj);
////                            })
////                        }
////                    })
////                }else
////                    cbk(err, user_obj);
////            })
//        }
