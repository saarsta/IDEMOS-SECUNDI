var models = require('../../models'),
    async = require('async');

/*
module.exports = {
    get: function (req, res) {
        var suggestion_id = req.params[0];
        var user_id = req.user.id;

        async.waterfall([
            function(cbk){
                models.Suggestion.Update(suggestion_id, cbk);
            },

            function(suggestion, cbk){
                if(suggestion.creator_id != user_id){
                    cbk({message: "user can set only his suggestion"});
                }
            }

        ])
        res.redirect(common.DEFAULT_LOGIN_REDIRECT);
    }
}

*/
