
var resources = require('jest'),
    util = require('util'),
    models = require('../../models'),
    async = require('async'),
    common = require('./../common'),
    calc_thresh = require('../../tools/calc_thresh.js'),
    GradeActionSuggestion = require('./grade_action_suggestion_resource.js'),
    ActionSuggestion = require('./ActionSuggestionResource.js'),
    og_action = require('../../og/og.js').doAction;


//Authorization
var Authoriztion = function() {};
util.inherits(Authoriztion,resources.Authorization);

//Authoriztion.prototype.edit_object = function(req,object,callback){
//    //check if user already grade this action
//    var flag = false;
//
//    models.GradeAction.find({"action_id": object.action_id}, function(err, objects){
//        if (err){
//            callback(err, null);
//        }else{
//            for (var i = 0; i < objects.length; i++){
//                if(req.session.user_id == objects[i].user_id){
//                    flag = true;
//                    break;
//                }
//            }
//            if (flag){
//                callback({message:"user already grade this action",code:401}, null);
//            }else{
//                callback(null, object);
//            }
//        }
//    })
//};

var GradeActionResource = module.exports = common.GamificationMongooseResource.extend({
    init:function(){
        this._super(models.GradeAction,'grade_action', null);
//        GradeResource.super_.call(this,models.Grade);
        this.allowed_methods = ["get", "put", "post"];
        this.authorization = new Authoriztion();
        this.authentication = new common.SessionAuthentication();
        this.filtering = {action_id: {
            exact:null,
            in:null
        }};
    },

    create_obj:function(req,fields,callback)
    {
        var self = this;
        var g_grade_obj;
        var new_grade = null;
        var counter = 0;
        var threshold;
        var admin_threshold;
        var action_thresh;
        var action_obj;
        var proxy_power = req.user.num_of_given_mandates ? 1 + req.user.num_of_given_mandates * 1/9 : 1;
        var base = self._super;

        fields.proxy_power = proxy_power;
        fields.user_id = req.user._id;
        async.waterfall([

            function(cbk){
                base.call(self, req, fields, cbk);
            },

            //find actions
            function(grade_obj, cbk){
                g_grade_obj = grade_obj;
                models.Action.findById(grade_obj.action_id, cbk);
            },

            // 2) calculate action grade + set notifications for all users of proxy
            function(action, cbk){
                action_obj = action;
                async.parallel([
                    //2.1 set notifications for all users of proxy
                    function(cbk1){
                        cbk1(null, null);
                    },

                    // 2.2 calculate action grade
                    function(cbk1){
                        //cant grade your own action

                        action_thresh = Number(action.admin_threshold_for_accepting_change_suggestions) || action.threshold_for_accepting_change_suggestions
                        admin_threshold = action.admin_threshold_for_accepting_change_suggestions;

                        calculateActionGrade(g_grade_obj.action_id, function(err, _new_grade, evaluate_counter, _threshold){
                            new_grade = _new_grade;
                            counter = evaluate_counter;
                            threshold = _threshold
                            cbk1(err, threshold);
                        });
                    },

                    //2.3 add user to be part of the action
                    function(cbk1){
                        if (! _.any(action.users, function(user){ return user.user_id + "" == req.user.id})){
                            var new_user = {user_id: req.user._id, join_date: Date.now()};
                            models.Action.update({_id: action._id}, {$addToSet:{users: new_user}}, function(err, num){cbk1(err, num)});
                        }else{
                            cbk1(null, null);
                        }
                    }
                ],function(err, args){
                    cbk(err, args[1]);
                })
            },

            // 3) find suggestion object
            //calculate all change suggestion all over again and check if they approved
            function(threshold, cbk){
                models.ActionSuggestion.find({action_id: g_grade_obj.action_id}, {"_id":1}, function(err, results)
                {
                    cbk(err, results);
                });
            },

            // 4) calculate suggestion grades
            function(suggestions, cbk){
                var real_threshold
                async.forEach(suggestions, function(suggestion, itr_cbk){
                        GradeActionSuggestion.calculateActionSuggestionGrade(suggestion._id, g_grade_obj.action_id, null, null, action_thresh, null, null,function(err, obj){
                            //check if suggestion is over the threshold
                            real_threshold = Number(suggestion.admin_threshold_for_accepting_the_suggestion) || suggestion.threshold_for_accepting_the_suggestion;
                            if(suggestion.agrees && suggestion.agrees.length > real_threshold){

                                //approveSuggestion.exec()
                                ActionSuggestion.approveSuggestion(suggestion._id, function(err, obj1){
                                    itr_cbk(err, obj1);
                                })
                            }else
                                itr_cbk(err, obj);
                        });}
                    , function(err){
                        cbk(err);
                    });
            },

            // 5) publish to facebook
            function (cbk) {
                og_action({
                    action: 'rank',
                    object_name:'action',
                    object_url : '/actions/' + action_obj.id,
                    fid : req.user.facebook_id,
                    access_token:req.user.access_token,
                    user:req.user
                });
                cbk();
            },

            // update actions done by user
            function(cbk){
                models.User.update({_id:user._id},{$set: {"actions_done_by_user.grade_object": true}}, function(err){
                    cbk(err);
                });
            }
        ],
        // Final) set gamification details, return object
        function(err, args){
            req.gamification_type = "grade_action";
            req.token_price = common.getGamificationTokenPrice('grade_action') > -1 ? common.getGamificationTokenPrice('grade_action') : 0;

            callback(err, {new_grade: new_grade, evaluate_counter: counter, grade_id: g_grade_obj._id || 0});
        })
    },

    update_obj: function(req, object, callback){

        var g_grade;
        var self = this;
        var suggestions = [];
        var action_thresh;
        var proxy_power = req.user.num_of_given_mandates ? 1 + req.user.num_of_given_mandates * 1/9 : 1;


        var iterator = function(suggestion, itr_cbk){
            GradeActionSuggestion.calculateActionSuggestionGrade(suggestion._id, object.action_id, null, null, action_thresh, null, null,function(err, sugg_new_grade, sugg_total_counter){
                if(!err){
                    suggestions.push({
                        _id: suggestion._id,
                        grade: sugg_new_grade,
                        evaluators_counter: sugg_total_counter
                    })
                }
                itr_cbk(err, 0);
            });
        }

        object.proxy_power = proxy_power;
        self._super(req, object, function(err, grade_object){
            if(err){
                callback(err, null);
            }else{
                var new_grade, evaluate_counter;
                async.waterfall([

                    function(cbk){
                        g_grade = grade_object;

                        calculateActionGrade(object.action_id, function(err, _new_grade, _evaluate_counter){
                            new_grade = _new_grade;
                            evaluate_counter = _evaluate_counter;
                            cbk(err, 0);
                        });
                    },

                    //get action threshold so i can update every suggestion threshold
                    function(obj, cbk){
                        models.Action.findById(object.action_id, function(err, result){
                            cbk(err, result)
                        });
                    },

                    function(action_obj,cbk){

                        async.parallel([

                            //set notifications for all users of proxy
                            function(cbk1){
                                //Todo - set notifications
//                                models.User.find({"proxy.user_id": req.user._id}, function(err, slaves_users){
//                                    async.forEach(slaves_users, function(slave, itr_cbk){
//                                        notifications.create_user_proxy_vote_or_grade_notification("proxy_graded_discussion",
//                                            discussion_obj._id, slave._id, req.user._id,
//                                            null, null, g_grade.evaluation_grade,
//                                            function(err){
//                                                itr_cbk(err);
//                                            })
//                                    }, function(err){
//                                        cbk1(err);
//                                    })
//                                })
                                cbk1(null);
                            },

                            //calculate all change suggestion all over again
                            function(cbk1){

                                action_thresh = Number(action_obj.admin_threshold_for_accepting_change_suggestions) || action_obj.threshold_for_accepting_change_suggestions;
                                models.ActionSuggestion.find({action_id: grade_object.action_id}, {"_id":1}, function(err, results)
                                {
                                    cbk1(err, results);
                                });
                            }
                        ],
                            function(err, args){
                                cbk(err, args[1]);
                            }
                        )

                    },

                    function(suggestions, cbk){
                        async.forEach(suggestions, iterator, cbk);
                    }

                ], function(err){
                    callback(err, {new_grade: new_grade, evaluate_counter: evaluate_counter, suggestions: suggestions,grade_id: g_grade._id || 0})
                })
            }
        });
    }
});

function calculateActionGrade(action_id, callback){

    var count;
    var grade_sum;
    var new_grade;
    var threshold;

    async.waterfall([
        function(cbk){
            models.GradeAction.find({action_id: action_id}, {"evaluation_grade":1, "proxy_power":1}, cbk);
        },

        function(grades, cbk){
            count = grades.length;
            if(count){
                //calculate grade_sum with take proxy power in consideration
                grade_sum = _.reduce(grades, function(memo, grade){return memo + Number(grade.evaluation_grade * (grade.proxy_power || 1)); }, 0);
                //calculate count with take proxy power in consideration
                count = _.reduce(grades, function(memo, grade){return memo + Number(grade.proxy_power || 1)}, 0);
                new_grade = grade_sum / count;

                //calculate threshhold here
                threshold = calc_thresh.calculating_thresh(count, new_grade) || 50;

                models.Action.update({_id: action_id}, {$set: {grade: new_grade, evaluate_counter: count, threshold_for_accepting_change_suggestions: threshold}}, cbk);
            }else{
                cbk({message: "you have to grade before changing the grade" , code: 401});
            }
        }
    ],function(err, args){
        callback(err, new_grade, count, threshold);
    })
}


