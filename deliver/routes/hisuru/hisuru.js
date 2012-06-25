
 var models = require('../../../models');

 module.exports = function(req,res) {
         res.render('his_uru.ejs',{

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

 };
