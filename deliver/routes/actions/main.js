
var models = require('../../../models'),
    async = require('async');

module.exports = function(req, res){


    /*
    * 1. get action
    * 2. get "going_users" of action
    *
    *
    *
    * */
    async.parallel([
        function(cbk){
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
                    'cycle_id':1
                })
                .exec(cbk);
        }/*,

        function(cbk){
            models.Join.find({action_id: req.params[0]})
                .populate('user_id', ['_id', 'first_name', 'last_name', 'avatar_url', 'num_of_proxies_i_represent', 'score'])
                .exec(cbk);
        }*/
    ], function(err, args){


        var action = args[0];
//        var going_users = args[1];
        if(err)
            res.render('500.ejs',{error:err});
        else {

            if(!action)
                res.render('404.ejs');
            else {
                action.location=
                    'התעשייה 12, תל אביב';
                action.from_date=action.execution_date;
                action.to_date=action.execution_date;



                var is_going = false;
               // is user going to action?
               if(req.user){
                   var user_id = req.user._id;
                   is_going = _.any(going_users, function(going_user){ going_user._id + "" == user_id})
               }
               action.is_going = is_going;

                var ejsFileName=true?'action_approved.ejs':'action_append.ejs';
                res.render(ejsFileName,{
                    action: action,
                    tab: 'actions'
                   // pageType:'beforeJoin' //waitAction,beforeJoin

                });
            }
        }
    });
};
