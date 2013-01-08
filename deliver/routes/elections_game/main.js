

var models = require('../../../models')

    ,async = require('async')
    ,notifications = require('../../../api/notifications.js');

module.exports = function(req,res)
{


    models.User.find({'quote_game.played':true} )
       // .populate("proxy.user_id"/*,['id','_id','first_name','last_name','avatar','facebook_id','num_of_given_mandates', "followers",'score','num_of_proxies_i_represent']*/)

        .exec(function(err, users){
            var users_count  =   users ? users.length   :0;
            models.QuoteGameGames.find()
                .exec(function(err, hashes){
                        res.setHeader("Expires", "0");
                        res.render('elections_game.ejs',{
                        users       :   shuffle(users)       ,
                        users_icons_count :   Math.min(11,users_count)  ,
                        hash        :   makeid(10)  ,
                        game_played :   hashes.length+320 ,
                            /*meta: {
                             type: req.app.settings.facebook_app_name + ':discussion',
                             id: discussion.id,
                             image: ((discussion.image_field_preview && discussion.image_field_preview.url) ||
                             (discussion.image_field && discussion.image_field.url)),
                             title: discussion && discussion.title,
                             description: discussion.text_field_preview || discussion.text_field,
                             link: discussion && ('/discussions/' + discussion.id)
                             }*/
                    });
            });
        })

    function shuffle (o){ //v1.0
        for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }

    function makeid(len)
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < len; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

};
