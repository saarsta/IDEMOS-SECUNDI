var models = require('../../../models'),
    async = require('async');

module.exports = {
    get: function (req, res) {
        var id = req.params.cycle_id;
        async.parallel([
            function (callback) {
                models.Cycle.findById(id, callback);
            },
            function (callback) {
                models.ActionResource.find({}, callback);
            },
            function (callback) {
                models.Category.find({}, callback);
            }
        ], function (err, results) {
            var cycle = results[0],
                resources = results[1],
                categories = results[2];

            if (!cycle) {
                console.log('Cycle id ' + id + ' not found; returning 404.');
                res.render('404.ejs');
                return;
            }

            console.log('create action for cycle id ' + id + ': ' + cycle.title);

            res.render('action_create.ejs', {
                cycle: cycle,
                resources: resources,
                categories: categories
            });
        });
    },

    post: function (req, res) {
        req.body.cycle_id = req.params.cycle_id;

        // TODO: Some validation

        var action = new models.Action();
        action.cycle_id = req.body.cycle_id;
        action.title = req.body.title;
        action.text_field = req.body.text;
        // action.category = req.body.category; // TODO: Where does this go?
        action.execution_date.date = new Date(req.body.date + 'T' + req.body.time.from);
        action.execution_date.duration = new Date(req.body.time.to) - new Date(req.body.time.from);
        action.location = req.body.location;
        action.action_resources = req.body.resources.map(function (text) { return { resource: text, amount: 1, left_to_bring: 1 }; });
        action.required_participants = req.body.number_of_participants;
        action.tags = req.body.tags;

        action.save();

        // TODO: do something with the "share this on my wall" checkbox

        // TODO: some sort of response.
        res.write('ok');
        res.end();
    }
};