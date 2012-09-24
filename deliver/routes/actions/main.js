var models = require('../../../models'),
    async = require('async'),
    notifications = require('../../../api/notifications');

module.exports = function (req, res) {


    /*
     * 1. get action
     * 1.1 get user grade
     * 2. get "going_users" of action
     *
     * final - is curr user going
     * */
    var user = req.session.user;

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
            system_message: 1
        })
        .populate('action_resources.resource')
        .populate('category', { _id: 1, name: 1 })
        .populate('cycle_id', { _id: 1, title: 1 })
        .exec(function (err, action) {
            if (err) {
                console.log('actions/main.js: Error finding action by id. ', arguments);
                return res.render('500.ejs', {error:err});
            }

            if (!action) {
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
                    if (req.session.user)
                        models.User.findById(req.session.user._id, cbk);
                    else {
                        cbk(null, null);
                    }
                },

                going_users: function (cbk) {
                    models.Join.find({action_id: req.params[0]})
                        .select({_id:1, user_id:1})
                        .exec(cbk);
                }

            }, function (err, args) {
                if (err) {
                    return res.render('500.ejs', {error:err});
                }

                var proxyJson = args.user ? JSON.stringify(args.user.proxy) : null;
                var going_users = args.going_users;

                action.grade_obj = args.grade;

                action.from_date = action.execution_date.date;
                // action.to_date = action.from_date.addHours(action.execution_date.duration);
                action.to_date = new Date(action.execution_date.date.getTime() + action.execution_date.duration);
                var is_going = false;

                // is user going to action?
                if(user){
                    var user_id = user._id;
                    is_going = going_users.some(function(going_user){ return going_user.user_id + "" == user_id + ""})
                }
                action.is_going = is_going;


                var ejsFileName = action.is_approved ? 'action_approved.ejs' : 'action_append.ejs';
                console.log(action.text_field_preview);
                res.render(ejsFileName,{
                    action: action,
                    tab: 'actions',
                    proxy:proxyJson
                    // pageType:'beforeJoin' //waitAction,beforeJoin
                });
            });
        });
};
