var models = require('../../models'),
    async = require('async'),
    notifications = require('../../api/notifications');

module.exports = function (req, res) {


    /*
     * 1. get action
     * 1.1 get user grade
     * 2. get "going_users" of action
     *
     * final - is curr user going
     * */
    var user = req.user;

    models.Action.findById(req.params[0])
        .select({
            _id: 1,
            creator_id: 1,
            category: 1,
            title: 1,
            text_field: 1,
            text_field_preview: 1,
            image_field: 1,
            image_field_preview: 1,
            tags: 1,
            location: 1,
            execution_date: 1,
            required_participants: 1,
            num_of_going: 1,
            cycle_id: 1,
            action_resources: 1,
            grade: 1,
            evaluate_counter: 1,
            is_approved: 1,
            admin_text: 1,
            //system_message: 1,
            what_users_bring: 1,
            going_users: 1,
            cycle_id: 1,
            social_popup: 1,
            _preview:1
        })
        .populate('action_resources.resource')
        .populate('category', { _id: 1, name: 1 })
        .populate('cycle_id.cycle', { _id: 1, title: 1 })
        .populate('what_users_bring.user_id', {_id: 1, first_name: 1, last_name: 1, avatar: 1, facebook_id: 1})

        .exec(function (err, action) {
            if (err) {
                console.log('actions/main.js: Error finding action by id. ', arguments);
                return res.render('500.ejs', {error:err});
            }

            if (!action || !action.cycle_id) {
                console.log('actions/main.js: Action not found. ', arguments);
                return res.render('404.ejs', {error:err});
            }

            async.parallel({
                grade: function(cbk) {
                    //if pending find grade
                    if (user && !action.is_approved) {
                        models.GradeAction.findOne({ user_id:user._id, action_id: req.params[0] }, function (err, grade) {
                            if (!grade) {
                                cbk(err, null);
                            } else {
                                cbk(err, {
                                    grade_id: grade._id,
                                    value: grade.evaluation_grade
                                });
                            }
                        });
                    } else {
                        cbk(err, null);
                    }
                },

                user: function (cbk) {
                    _.each(action.what_users_bring, function(obj){obj.user_id.avatar = obj.user_id.avatar_url()});
                    cbk(null, req.user);
                }
            }, function (err, args) {
                if (err) throw err;

                var proxyJson = args.user ? JSON.stringify(args.user.proxy) : null;
                var going_users = action.going_users;
                var cycle = action.cycle_id[0];

                action.num_of_going = going_users.length;
                action.grade_obj = args.grade;
                action.from_date = action.execution_date.date;
                // action.to_date = action.from_date.addHours(action.execution_date.duration);
                action.to_date = new Date(action.execution_date.date.getTime() + action.execution_date.duration);
                var is_going = false;

                // is user going to action?
                if(user){
                    var user_id = user._id;
                    is_going = going_users.some(function(going_user){ return going_user.user_id + "" == user_id + ""});
                }
                action.is_going = is_going;
                action.cycle_id = cycle;
                var main_title = action.cycle_id[0].cycle.title + ' - ' +  (action && action.title);
                var ejsFileName = action.is_approved ? 'action_approved.ejs' : 'action_append.ejs';
                var type = action.is_approved ? 'approved_action' : 'pending_action';
                res.render(ejsFileName, {
                    action: action,
                    tab: 'actions',
                    type: type,
                    proxy: proxyJson,
                    social_popup: action.social_popup,

                    meta: {
                        type: req.app.settings.facebook_app_name + ':activity',
                        id: action.id,
                        image: ((action.image_field_preview && action.image_field_preview.url) ||
                            (action.image_field && action.image_field.url)),
                        title: action && action.title,
                        main_title: main_title,
                        description: action.text_field_preview || action.text_fiel,
                        link: action && ('/action/' + action.id)
                    }
                });
            });
        });
};
