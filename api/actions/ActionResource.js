/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 06/03/12
 * Time: 17:23
 * To change this template use File | Settings | File Templates.
 */

var resources = require('jest'),
    models = require('../../models'),
    async = require('async'),
    common = require('../common.js'),
    _ = require('underscore');

var hourDifference = function (from, to) {
    // This is a horrible hack to make the JavaScript Date object accept dateless times.
    // It's better than writing the code myself though.
    return new Date('1 Jan 2001 ' + to) - new Date('1 Jan 2001 ' + from);
};

var asArray = function (arg) {
    if (arg && arg.constructor == Array)
        return arg;
    else
        return [];
};

var ActionResource = module.exports = common.GamificationMongooseResource.extend({
    init:function () {
        this._super(models.Action, null, 0);
        this.allowed_methods = ['get', 'post', 'put'];
        this.filtering = {
            subject_id: null,
            cycle_id:null,
            is_approved:null,
            grade:null,
            num_of_going:null,
            'users.user_id': {
                exact:true,
                in:true
            }
        };
        this.authentication = new common.SessionAuthentication();
        this.default_query = function (query) {
            return query.sort({"execution_date.date":'descending'});
        };

        this.fields = {
            _id: null,
            title: null,
            tooltip_or_title: null,
            text_field: null,
            text_field_preview: null,
            image_field: null,
            image_field_preview: null,
            type: null,
            creator_id: null,
            cycle_id: null,
            cycle_title: null,
            action_resources: null,
            tags: null,
            users: null,
            execution_date: null,
            creation_date: null,
            required_participants: null,
            admin_text: null,
            system_message: null,
            num_of_going: null,
            is_approved: null,
            location: null,
            grade: null,
            evaluate_counter: null,
            grade_sum: null,
            participants_count: null,
            is_going: null,
            redirect_link: null
        }
    },

    get_objects:function (req, filters, sorts, limit, offset, callback) {
        if (req.query.get == "myUru") {
            var user_id = req.query.user_id || req.user._id;
            filters['users.user_id'] = user_id;
        }

        this._super(req, filters, sorts, limit, offset, function (err, response) {

            async.forEach(response.objects, function (action, itr_cbk) {
                action.participants_count = action.users.length;
                action.is_going = req.user && _.any(action.going_users, function(going_user){return going_user.user_id + "" == req.user._id + ""});

                models.Cycle.findById(action.cycle_id, {title: 1}, function(err, cycle){
                    action.cycle_title = cycle.title;
                    itr_cbk();
                })
            }, function(err){
                callback(err,response);
            });




            // TODO i need to fix it for my uru
//                _.each(response.objects, function(object){
//                    object.is_going = false;
//                    if(req.user){
//                        var user_id = req.user._id;
//                        if(_.any(object.going_users, function(user){ user.user_id = user_id;})){
//                            object.is_going = true;
//                            models.Join.findOne({action_id: object._id, user_id: user_id}, function(err, join){
//                                if(!err)
//                                    object.join_id = join._id;
//                            })
//                        }
//                    }
//                });


//            callback(err, response);
        });
    },

    create_obj:function (req, fields, callback) {
        var user_id = req.session.user_id;
        var self = this;
        var base = self._super;
        var action_object = new self.model();
        var user = req.user;
        var g_action;

        var iterator = function (info_item, itr_cbk) {
            info_item.actions.push(g_action._id);

            for (var i = 0; i < info_item.users.length; i++) {
                if (info_item.users[i] + "" == user._id + "") {
                    info_item.users.splice(i, 1);
                    i--;
                }
            }
            info_item.save(itr_cbk());
        };

        var min_tokens = common.getGamificationTokenPrice('create_action') > -1 ? common.getGamificationTokenPrice('create_action') : 10;
//            var total_tokens = user.tokens + user.num_of_extra_tokens;

//            if(total_tokens <  min_tokens && total_tokens < min_tokens - (Math.min(Math.floor(user.gamification.tag_suggestion_approved/2), 2))){
//                callback({message: "user must have a least 10 tokens to open create discussion", code:401}, null);
//            }
//            else
//            {

        async.waterfall([

            function(cbk){
                models.Cycle.findById(fields.cycle_id, cbk);
            },

            function(cycle, cbk){

                if(!cycle)
                    cbk('no such cycle');
                else{

                    if (fields.text_field.length >= 200)
                        fields.text_field_preview = fields.text_field.substr(0, 200);
                    else
                        fields.text_field_preview = fields.text_field;

                    fields.subject_id = cycle.subject[0].id;

                    // Data external to the request
                    fields.creator_id = user_id;
                    fields.first_name = user.first_name;
                    fields.last_name = user.last_name;
                    fields.users = {user_id: user_id, join_date: Date.now()};
                    fields.num_of_going = 0;

                    // Massage some of the data to an acceptable format
                    fields.execution_date = {
                        date: new Date(fields.date + 'T' + fields.time.from),
                        duration: hourDifference(fields.time.from, fields.time.to)
                    };
                    fields.action_resources = asArray(fields.action_resources)
                        .filter(function (obj) { return obj; } )
                        .map(function (obj) { return { resource: obj.id, amount: 1, left_to_bring: obj.checked ? 0 : 1 }; });

                    fields.what_users_bring = asArray(fields.what_users_bring);
                    for(var i = 0; i < fields.action_resources.length; i++)
                    {
                        var resource_amount = fields.action_resources[i].amount - fields.action_resources[i].left_to_bring;
                        var new_what_users_bring = {
                            resource: fields.action_resources[i].resource,
                            amount: resource_amount,
                            user_id: (resource_amount == 0) ? null : user_id
                        }

                        if(new_what_users_bring.user_id != null)
                        {
                            fields.what_users_bring.push(new_what_users_bring);
                        }
                    }

                    if (fields.location && typeof fields.location.geometry == 'string') {
                        var latlng = fields.location.geometry.split(',');
                        if (latlng.length == 2) {
                            fields.location.geometry = {
                                lat: latlng[0],
                                lng: latlng[1]
                            };
                        }
                    }

                    for (var field in fields) {
                        action_object.set(field, fields[field]);
                    }

                    base.call(self, req, fields, cbk);
                }
            },

            function(action_obj, cbk){
                g_action = action_obj;
                var cycle_id = action_obj.cycle_id;

                async.parallel([

                    // 1. add discussion_id and action_id to the lists in user

                    // 2. update actions done by user
                    function (cbk1) {
                        req.gamification_type = "action";

                        // 1. add discussion_id and action_id to the lists in user
                        var new_action = {
                            action_id: action_obj._id,
                            join_date: Date.now()
                        }

                        models.User.update({_id:user_id}, {$addToSet:{actions: new_action}, $set: {"actions_done_by_user.create_object": true}}, cbk1)
                    },

                    function (cbk1) {
                        models.Cycle.findById(cycle_id, cbk1);
                    },

                    //find user's information items, and add it to action
                    function(cbk1){
                        models.InformationItem.find({users: user._id}, function(err, info_items){
                            if(err)
                                cbk1(err);
                            else{
                                async.forEach(info_items, iterator, cbk1);
                            }
                        })
                    }

                ], function(err, args){
                    cbk(err, args[1]);
                })
            },

            function(cycle, cbk){
                if (cycle.upcoming_action) {
                    async.waterfall([
                        function (cbk1) {
                            models.Action.findById(cycle.upcoming_action, cbk1);
                        },

                        function (upcoming_action, cbk1) {
                            if (!upcoming_action || upcoming_action.execution_date.date > g_action.execution_date.date) {
                                cycle.upcoming_action = g_action._id;
                                cycle.save(cbk1);
                            }else{
                                cbk1(null);
                            }
                        }
                    ], function(err){
                        cbk(err)})
                } else {
                    cycle.upcoming_action = g_action._id;
                    cycle.save(function(err, cycle){
                        cbk(err)
                    });
                }
            }
        ], function(err){
            callback(err, {
                redirect_link: g_action ? req.app.get('root_path') + '/actions/' + g_action.id : null,
                _id: g_action.id
            });
        })
    }
});

module.exports.approveAction = function (id, callback) {

    var is_first_approved_action_of_cycle = false;
    var g_action;
    var g_cycle;

    async.waterfall([

        //find action
        function (cbk) {
            models.Action.findById(id, cbk);
        },

        //find cycle
        function(action, cbk){
            if(action.is_approved)
                cbk("action is already approved");
            else{
                g_action = action;
                action.is_approved = true;

                models.Cycle.findOne({_id: action.cycle_id, is_hidden: -1}, cbk);

            }
        },

        //set actions as "approved" and if this action is the cycle's upcoming_action set it...
        function(cycle, cbk){
            g_cycle = cycle;

            if(cycle.upcoming_action){
                models.Action.findById(cycle.upcoming_action, function(err, up_action){
                    cbk(err, up_action);
                });
            }else{
                is_first_approved_action_of_cycle = true;
                cbk();
            }

        },

        function(upcoming_action, cbk){
            if(is_first_approved_action_of_cycle || (g_action && g_action.execution_date.date < upcoming_action.execution_date.date)){
                g_cycle.upcoming_action = g_action;
                g_cycle.save(cbk);
            }else{
                cbk();
            }
        }],

        function(err, obj){
            if(!err){
                g_action.save(
                    function(err, action){
                        callback(err, action);
                    }
                );
            }else{
                callback(err);
            }
        })
}
