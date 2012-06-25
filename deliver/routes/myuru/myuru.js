var models = require('../../../models');
var async = require('async');
var TokensBarModel= require('./tokensBarModel')

module.exports = function (req, res) {

    var userID= req.params;
    var user = req.session.user;

    async.waterfall([
        function (cbk) {
            models.User.findById(req.session.user._id, ["tokens", "num_of_extra_tokens", "proxy", "biography"], function(err, user){
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
        //todo remove me
     /*   proxy =[
            {details:
                {last_name:'aaa',_id:'1111',avatar:'http://graph.facebook.com/1010279474/picture/?type=large',first_name:'avi'},
                number_of_tokens:2
            },
            {details:
            {last_name:'man',_id:'1111',avatar:'http://graph.facebook.com/1010279474/picture/?type=large',first_name:'run'},
                number_of_tokens:1
            }
        ]*/
        var tokensBarModel = new TokensBarModel(9, num_of_extra_tokens, tokens, proxy);

        res.render('my_uru.ejs',
            {
                layout:false,
                tag_name:req.query.tag_name,
                biographyReadonly:false,
                title:"אורו שלי",
                logged:req.isAuthenticated(),
                big_impressive_title:"",
                user:user,
                pageUser:user,
                avatar:req.session.avatar_url,
                user_logged:req.isAuthenticated(),
                url:req.url,
                facebook_app_id:req.app.settings.facebook_app_id,
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
