var models = require('../../../models');
var async = require('async');
var TokensBarModel= require('./tokensBarModel')

module.exports = function (req, res) {

    var userID= req.params[0];
   // console.log( req.params);
    var user = req.session.user;

    async.waterfall([
        function (cbk) {
            models.User.findById(userID, ["tokens", "num_of_extra_tokens", "proxy", "biography"], function(err, user){
                req.session.user.biography = user.biography;
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
                        proxy_user.details = curr_proxy_user;
                    }
                    itr_cbk();
                })
            }, function (err, ocj) {
                cbk(err, user_obj);
            })
        }


    ], function (err, user_obj) {
        var proxy =  user_obj.proxy  ;
        var num_of_extra_tokens = user_obj.num_of_extra_tokens;
        var tokens =  user_obj.tokens+'';
        var proxy = user_obj.proxy;
        var tokensBarModel = new TokensBarModel(9, num_of_extra_tokens, tokens, proxy);

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
