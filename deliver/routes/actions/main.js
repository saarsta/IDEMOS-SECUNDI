var models = require('../../../models'),
    async = require('async');

module.exports = function (req, res) {


    /*
     * 1. get action
     * 2. get "going_users" of action
     *
     *
     *
     * */

    async.parallel([
        function (cbk) {
            models.Action.findById(req.params[0])
                .select({
                    '_id':1,
                    'type':1,
                    'title':1,
                    'text_field':1,
                    'image_field':1,
                    'tags':1,
                    'location':1,
                    'execution_date':1,
                    'required_participants':1,
                    'cycle_id':1,
                    'action_resources':1
                })
                .populate('action_resources.resource')
                .exec(cbk);
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




        if (err)
            res.render('500.ejs', {error:err});
        else {

            if (!action)
                res.render('404.ejs');
            else {
                action = JSON.parse(JSON.stringify(action));
                action.action_resources = _.map(action.action_resources, function(resource){
                    return  {action_resource : {
                        name: resource.resource.name,
                        id: resource.resource._id,
                        amount: resource.amount,
                        left: resource.left_to_bring
                    }}
                });
                action.location =
                    'התעשייה 12, תל אביב';

                action.from_date= action.execution_date.date;
               // action.to_date= action.from_date.addHours(action.execution_date.duration);
                action.to_date= new Date(action.execution_date.date.getTime() + action.execution_date.duration*1000*3600);
                var is_going = false;
               // is user going to action?
               if(req.session.user){
                   var user_id = req.session.user._id;
                   is_going = _.any(going_users, function(going_user){ return going_user.user_id + "" == user_id + ""})
               }
               action.is_going = is_going;


                var ejsFileName = true ? 'action_approved.ejs' : 'action_append.ejs';
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
