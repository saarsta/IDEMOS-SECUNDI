var models = require('../../models');
var async = require('async');
var TokensBarModel= require('./tokensBarModel');

module.exports = function (req, res) {

    var isHisuru=req.params[0]? true: false;
    var pageUserID = isHisuru ? req.params[0] : req.user.id;
    var sessionUser = req.user;
    var curr_user_db;

    if(!(isHisuru && !req.user)){
        if(isHisuru && pageUserID === req.user.id){
            isHisuru=false;
        }
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
                        .select({
                            "tokens":1,
                            "num_of_extra_tokens":1,
                            "proxy":1 ,
                            "biography":1,
                            "first_name":1,
                            "last_name":1,
                            "facebook_id":1,
                            "avatar":1,
                            "score":1,
                            "followers":1,
                            'num_of_proxies_i_represent':1
                        })
                        .populate("proxy.user_id"/*,['id','_id','first_name','last_name','avatar','facebook_id','num_of_given_mandates', "followers",'score','num_of_proxies_i_represent']*/)

                        .exec(function(err, user){
                            if(req.user)
                                req.user.biography = user && user.biography;
                            cbk1(err, user);
                        })
                },

                //1.2
                function(cbk1){
                    //get details of the current user that watch "his uru"
                    if(sessionUser && pageUserID != sessionUser._id){

                        models.User.findById(sessionUser._id).select({"tokens": 1, "num_of_extra_tokens": 1, "proxy": 1, "biography": 1,"first_name": 1 ,"last_name": 1,"facebook_id": 1, "avatar": 1,"score": 1, "followers": 1,'num_of_proxies_i_represent': 1})

                        models.User.findById(sessionUser._id).select({
                            "tokens":1,
                            "num_of_extra_tokens":1,
                            "proxy":1,
                            "biography":1,
                            "first_name":1,
                            "last_name":1,
                            "facebook_id":1,
                            "avatar":1,
                            "score":1,
                            "followers":1,
                            'num_of_proxies_i_represent':1
                        })

                            .populate("proxy.user_id"/*,['_id','first_name','last_name','avatar','facebook_id','num_of_given_mandates','score','num_of_proxies_i_represent']*/)

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
                    // and see if i follow him or not
                    _.each(curr_user_db.proxy, function(proxy){
                        proxy.details = proxy.user_id;
                    });

                    //find if the user is a follower of the "his uru" user
                    my_or_his_uru_user.is_follower_of_user = false;
                    if(isHisuru){
                        if(_.any(my_or_his_uru_user.followers, function(follower){ return follower.follower_id + "" == curr_user_db._id + ""})){
                            my_or_his_uru_user.is_follower_of_user = true;
                        }
                    }
                }

                cbk(err, my_or_his_uru_user);
            })
        }

    ], function (err, user_of_this_page) {
        //2
        if(!user_of_this_page.proxy)
            console.error("data curruption with user proxies");
        var proxy =  user_of_this_page.proxy || [];

        var num_of_extra_tokens = user_of_this_page.num_of_extra_tokens;
        var tokens =  user_of_this_page.tokens;

        var tokensBarModel = new TokensBarModel(9, num_of_extra_tokens, tokens, proxy);
        var proxyToSerializ = isHisuru && req.user ? sessionUser.proxy : proxy;
        for(var i=0 ;i<proxyToSerializ.length;i++){
            if( proxyToSerializ[i].user_id && !isHisuru){
                proxyToSerializ[i].user_id.avatar=   proxyToSerializ[i].user_id.avatar_url();
            }
        }
        var proxyJson= JSON.stringify(proxyToSerializ);
        res.render('my_uru.ejs', {
            layout: false,
            tag_name: req.query.tag_name,
            biographyReadonly: isHisuru,
            title: "עורו שלי",
            logged: req.isAuthenticated(),
            big_impressive_title: "",
            user: req.user,                 // logged user
            pageUser: user_of_this_page ,   // page user
            //   avatar:user_of_this_page.avatar_url(),
            curr_user_proxy: curr_user_db ? curr_user_db.proxy : null,
            user_logged: req.isAuthenticated(),
            url: req.url,
            tokensBarModel: tokensBarModel,
            tab: '',
            isHisUru: isHisuru,
            proxy: proxyJson
        });
    })
};
