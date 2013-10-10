var models = require('../../models');

module.exports = function(req,res)
{

    models.Cycle.findById(req.params[0], function(err, cycle){

        res.render('actions_list.ejs', {
            type: 'pending_action',
            cycle_id: req.params[0],
            cycle_title: cycle.title,
            social_popup_title: null
        });
    })

};