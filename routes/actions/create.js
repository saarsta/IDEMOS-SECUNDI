var models = require('../../models'),
    async = require('async'),
    utils = require('../../utils');

module.exports = {
    get: function (req, res) {
        var id = req.params.cycle_id;
        async.parallel({
            cycle: function (callback) {
                models.Cycle.findById(id, callback);
            },
            resources: function (callback) {
                models.ActionResource.find({ is_approved: true }, callback);
            },
            categories: function (callback) {
                models.Category.find({}, callback);
            }
        }, function (err, results) {
            if (!results.cycle) {
                console.log('Cycle id ' + id + ' not found; returning 404.');
                res.render('404.ejs');
                return;
            }

            res.render('action_create.ejs', {
                cycle: results.cycle,
                resources: results.resources,
                categories: results.categories,
                today: utils.dateFormat('yyyy-mm-dd'),
                user:req.user,
                social_popup_title: null
            });
        });
    }
};
