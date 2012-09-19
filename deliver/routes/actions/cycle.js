var models = require('../../../models');

module.exports = function(req,res)
{
    console.log(req.params[0]);
    res.render('actions_list.ejs', {
            cycle_id: req.params[0]
        });
};