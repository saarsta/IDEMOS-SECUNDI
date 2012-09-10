var models = require('../../../models'),
    async = require('async'),
    utils = require('../../../utils');

var hourDifference = function (from, to) {
    // This is a horrible hack to make the JavaScript Date object accept dateless times.
    // It's better than writing the code myself though.
    return new Date('1 Jan 2001 ' + to) - new Date('1 Jan 2001 ' + from);
}

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

            var today = utils.dateFormat('yyyy-mm-dd');

            res.render('action_create.ejs', {
                cycle: cycle,
                resources: resources,
                categories: categories,
                today: today
            });
        });
    },

    post: function (req, res) {
        // TODO: Some validation

        var action = new models.Action();

        action.creator_id = req.session.user;
        action.cycle_id = req.body.cycle_id;

        action.title = req.body.title;
        action.text_field = req.body.text;
        action.type = req.body.category;
        action.execution_date.date = new Date(req.body.date + 'T' + req.body.time.from);
        action.execution_date.duration = hourDifference(req.body.time.from, req.body.time.to);
        action.location = req.body.location;
        // action.action_resources = req.body.resources.map(function (text) { return { resource: text, amount: 1, left_to_bring: 1 }; });
        action.required_participants = req.body.number_of_participants || 0;
        action.tags = req.body.tags;

        // TODO: do something with the "share this on my wall" checkbox

        action.save(function (err) {
            res.write(JSON.stringify({
                errors: err[0],
                redirect: req.app.get('root_path') + '/actions/' + action.id
            }));
            res.end();
        });
    }
};
