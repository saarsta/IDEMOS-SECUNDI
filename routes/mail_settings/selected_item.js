var models = require('../../models');
var main = require('./main');

module.exports = function(req, res){

    var user = req.session.user;

    main.getSettingsParams(req, user, function(err, user_obj, discussion_list, cycle_list, user_discussions_hash, user_cycles_hash){

        var discussion_id = req.params[0];

        res.render('mail_configuration.ejs',{
            title:"הגדרות עדכונים",
            user: user_obj,
            selected_item: discussion_id,
            discussions: discussion_list,
            discussions_hash: user_discussions_hash,
            cycles: cycle_list,
            cycles_hash: user_cycles_hash
        });
    })
};