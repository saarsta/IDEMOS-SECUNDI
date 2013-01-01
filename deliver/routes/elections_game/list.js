

var models = require('../../../models')

    ,async = require('async')
    ,notifications = require('../../../api/notifications.js');

module.exports = function(req,res)
{
      models.QuoteGameCandidate.find()
        // .populate("proxy.user_id"/*,['id','_id','first_name','last_name','avatar','facebook_id','num_of_given_mandates', "followers",'score','num_of_proxies_i_represent']*/)

        .exec(function(err, candidates){
            res.render('elections_game_list.ejs',{
                candidates:candidates
            });
        })
};
