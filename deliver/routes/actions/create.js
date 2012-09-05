var models = require('../../../models');

module.exports = function (req, res) {
    var id = req.params.cycle_id;
    models.Cycle.findById(id, function (_, cycle) {
        if (!cycle) {
            console.log('Cycle id ' + id + ' not found; returning 404.')
            res.render('404.ejs');
            return;
        }

        console.log('create action for cycle id ' + id + ': ' + cycle.title);

        res.render('action_create.ejs',{
            cycle: cycle
        });
    });
};