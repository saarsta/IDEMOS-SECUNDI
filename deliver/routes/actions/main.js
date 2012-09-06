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
    var grade_obj;

    async.parallel([
        function (cbk) {
            models.Action.findById(req.params[0])
                .select({
                    '_id':1,
                    'creator_id': 1,
                    'type':1,
                    'title':1,
                    'text_field':1,
                    'image_field':1,
                    'tags':1,
                    'location':1,
                    'execution_date':1,
                    'required_participants':1,
                    'cycle_id':1,
                    'action_resources':1,
                    'grade': 1,
                    'evaluate_counter': 1,
                    'is_approved':1,
                    'admin_text':1,
                    'system_message': 1
                })
                .populate('action_resources.resource')
                .populate('cycle_id', {'_id': 1, 'title': 1})
                .exec(function(err, action){
                    //if pending find grade
                    if(!err && user && !action.is_approved){
                        models.GradeAction.findOne({user_id:user._id, action_id: req.params[0]}, function (err, grade) {
                            if (grade) {
                                grade_obj = {};
                                grade_obj["grade_id"] = grade._id;
                                grade_obj["value"] = grade.evaluation_grade;
                            }
                            cbk(err, action);
                        });
                    }else{
                        cbk(err, action);
                    }
                });
        },

        // get the user object
        function (cbk) {
            if (req.session.user)
                models.User.findById(req.session.user._id, cbk);
            else {
                cbk(null, null);
            }
        },

        function (cbk) {
            models.Join.find({action_id: req.params[0]})
                .select({_id:1, user_id:1})
                .exec(cbk);
        }
    ], function (err, args) {


        var action = args[0];
        var proxyJson = args[1] ? JSON.stringify(args[1].proxy) : null;
        var going_users = args[2];

        action.grade_obj = grade_obj;


        if (err)
            res.render('500.ejs', {error:err});
        else {

            if (!action)
                res.render('404.ejs');
            else {


                action.from_date= action.execution_date.date;
               // action.to_date= action.from_date.addHours(action.execution_date.duration);
                action.to_date= new Date(action.execution_date.date.getTime() + action.execution_date.duration*1000*3600);
                var is_going = false;
               // is user going to action?
               if(user){
                   var user_id = user._id;
                   is_going = _.any(going_users, function(going_user){ return going_user.user_id + "" == user_id + ""})
               }
               action.is_going = is_going;

                var ejsFileName = action.is_approved ? 'action_approved.ejs' : 'action_append.ejs';
                res.render(ejsFileName,{
                    action: action,
                    tab: 'actions',
                    proxy:proxyJson
                    // pageType:'beforeJoin' //waitAction,beforeJoin
                });
            }
        }
    });
};
