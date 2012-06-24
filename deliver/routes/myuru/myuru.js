
var models = require('../../../models');

module.exports = function(req,res)
{

    function TokensBarModel(tokenPixels,user){
        var totalProxy=2;
        var dailyTokens = Math.floor(user.DailyTokens);
        var gupFromFull=  15-9// dailyTokens;
        var  availableTokens=this.dailyTokens-this.totalProxy-user.tokens;

        function convertToPixels(num){
          return (num*tokenPixels)+'px';
        }
        this.gupFromFullPixels=function (){
          return convertToPixels(gupFromFull)  ;
        }



    }


    var user= req.session.user  ;
    var tokensBarModel= new TokensBarModel(10,user);


    models.User.findById(req.session.user._id, ["tokens", "num_of_extra_tokens", "proxy"], function(err, user_obj){

        var daily_tokens = 9 + user_obj.num_of_extra_tokens;
        res.render('my_uru.ejs',
            {
                layout: false,
                tag_name:req.query.tag_name,

                title:"אורו שלי",
                logged: req.isAuthenticated(),
                big_impressive_title: "",
                user: user,
                avatar:req.session.avatar_url,
                user_logged: req.isAuthenticated(),
                url:req.url,
                tokensBarModel:tokensBarModel,
                tab:''
            });
    });

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
