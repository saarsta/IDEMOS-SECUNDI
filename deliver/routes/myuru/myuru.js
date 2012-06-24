var models = require('../../../models');
var async = require('async');

module.exports = function (req, res) {

    function TokensBarModel(tokenPixels, numExtraTokens, tokens, proxy) {

        this.proxy = proxy;
        this.totalProxy = proxy.sum;// blue;
        var dailyTokens = 9 + numExtraTokens;
        this.floorDailyTokens = Math.floor(dailyTokens);

        this.gupFromFull = 15 - this.floorDailyTokens; //light gray
        this.floorTokens = Math.floor(tokens); //green
        this.tokensIUsed = this.floorDailyTokens - this.floorTokens - this.totalProxy //dark gray


        //  var  availableTokens=this.dailyTokens-this.totalProxy-user.tokens;

        this.convertToPixels = function (num) {
            return (num * tokenPixels) + 'px';
        }
        this.gupFromFullPixels = function () { //light gray
            return this.convertToPixels(this.gupFromFull);
        }
        this.dailyTokensPixels = function () { //dark  gray
            return this.convertToPixels(this.tokensIUsed);
        }
        this.tokensPixels = function () { //green
            return this.convertToPixels(this.floorTokens);
        }
        this.ProxyPixels = function () { //blue
            return this.convertToPixels(this.totalProxy);
        }

    }


    var user = req.session.user;

    async.waterfall([
        function (cbk) {
            models.User.findById(req.session.user._id, ["tokens", "num_of_extra_tokens", "proxy"], function(err, user){
                cbk(err, user);
            })
        },

        function (user_obj, cbk) {
            if(!user_obj.proxy){
                user_obj.proxy = [];
            }
            async.forEach(user_obj.proxy, function (proxy_user, itr_cbk) {
                models.User.findById(proxy_user.user_id, ["_id", "first_name", "last_name", "facebook_id", "avatar"], function (err, curr_proxy_user) {
                    if (!err) {
                        curr_proxy_user.avatar = curr_proxy_user.avatar_url();
                        proxy_user.user_id = curr_proxy_user;
                    }
                    itr_cbk();
                })
            }, function (err, ocj) {
                cbk(err, user_obj);
            })
        }

    ], function (err, user_obj) {
        var dummyProxy = {
            sum:5,
            proxies:[
                {name:'avner', proxy:2, _id:1},
                {name:'moty', proxy:1, _id:2},
                {name:'ron', proxy:2, _id:3}
            ]
        }

        var num_of_extra_tokens = 2//user_obj.num_of_extra_tokens ;
        var tokens = 4 // user_obj.tokens;
        var proxy = user_obj.proxy;
        var tokensBarModel = new TokensBarModel(9, num_of_extra_tokens, tokens, dummyProxy);
        res.render('my_uru.ejs',
            {
                layout:false,
                tag_name:req.query.tag_name,

                title:"אורו שלי",
                logged:req.isAuthenticated(),
                big_impressive_title:"",
                user:user,
                avatar:req.session.avatar_url,
                user_logged:req.isAuthenticated(),
                url:req.url,
                tokensBarModel:tokensBarModel,
                tab:''
            });
    })
};


/*

 var models = require('../../../models');

 module.exports = function(req,res)
 {
 res.render('my_uru.ejs',{
 */
/*  title:'הדף שלי',
 user: req.session.user,
 logged:true,
 avatar:req.session.avatar_url,
 // body_class:'layout',
 big_impressive_title:"כותרת גדולה ומרשימה",
 extra_head:'',
 tag_name: req.query.tag_name,
 tab:'users',
 hide_block_user:false,
 extra_head:'<script src="/javascripts/myUru.js"></script>'*//*


 });

 };*/
