

var models = require('../../../models')

    ,async = require('async')
    ,notifications = require('../../../api/notifications.js');

module.exports = function(req,res)
{


    models.User.find({ 'quote_game.played':  {$eq:true}   })
       // .populate("proxy.user_id"/*,['id','_id','first_name','last_name','avatar','facebook_id','num_of_given_mandates', "followers",'score','num_of_proxies_i_represent']*/)
        .exec(function(err, users){
            models.QuoteGameHashes.find().exec(function(err, hashes){
                res.setHeader("Expires", "0");
                res.render('elections_game.ejs',{
                    users       :  users       ,
                    hash        :  makeid(10)  ,
                    game_played :  hashes.length
                    //    tab:'discussions',
                    //   discussion: daily_discussion,
                    //    fb_description: daily_discussion.text_field_preview,
                    //    fb_title: daily_discussion.title,
                    //    fb_image:daily_discussion.image_field && daily_discussion.image_field.url

                });
            });
        })

    function makeid(len)
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < len; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

};
