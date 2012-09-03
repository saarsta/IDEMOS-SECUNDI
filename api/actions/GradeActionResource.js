
var resources = require('jest'),
    util = require('util'),
    models = require('../../models'),
    async = require('async'),
    common = require('./../common'),
    calc_thresh = require('../../deliver/tools/calc_thresh.js'),
    og_action = require('../../og/og.js').doAction;


//Authorization
var Authoriztion = function() {};
util.inherits(Authoriztion,resources.Authorization);

Authoriztion.prototype.edit_object = function(req,object,callback){
    //check if user already grade this action
    var flag = false;
    models.GradeAction.find({"action_id": object.action_id}, function(err, objects){
        if (err){
            callback(err, null);
        }else{
            for (var i = 0; i < objects.length; i++){
                if(req.session.user_id == objects[i].user_id){
                    flag = true;
                    break;
                }
            }
            if (flag){
                callback({message:"user already grade this action",code:401}, null);
            }else{
                callback(null, object);
            }
        }
    })
};

var GradeActionResource = module.exports = common.GamificationMongooseResource.extend({
    init:function(){
        this._super(models.Grade,'grade', null);
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
//        var user_id = req.session.user_id;
//        var self = this;
//        var object = new self.model();
//
//        object.user_id = user_id;
//        for( var field in fields)
//        {
//            object.set(field,fields[field]);
//        }
//        self.authorization.edit_object(req,object,function(err,object)
//        {
//            if(err) callback(err);
//            else
//            {
//                object.save(function(err, grade_object)
//                {
//                    if (err){
//                        callback(err, null);
//                    }
//                    else{
//                        var isNewFollower = false;
//                        models.User.findOne({_id: grade_object.user_id}, function(err,user_object){
//                            if(err){
//
//                            }else{
//                                if (common.isArgIsInList(grade_object.action_id, user_object.actions)  == false){
//                                    isNewFollower = true;
//                                    user_object.actions.push(grade_object.action_id);
//                                }
//
//                                models.Action.findOne({_id: grade_object.action_id}, function(err,action_object){
//                                    if (err){
//                                        callback(err, null);
//                                    }
//                                    else{
////                                      // calculating the current action grade
//                                        // + insert user to action
//                                        // + increase followers if necessary
//
//                                        action_object.grade_sum += parseInt(grade_object.evaluation_grade);
//                                        action_object.evaluate_counter++;
//                                        action_object.grade = action_object.grade_sum / action_object.evaluate_counter;
//                                        if (isNewFollower){
//                                            action_object.followers_count++;
//                                        }
//                                        action_object.save(function(err){
//                                            if (err){
//                                                callback(err, null)
//                                            }
//                                            else{
//                                                callback(self.elaborate_mongoose_errors(err), action_object);
//                                            }
//                                        })
//                                    }
//                                });
//                            }
//                        });
//                    }
//                });
//            }
//        });


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
                        //cant grade your own discussion

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
                //Todo
//                models.Suggestion.find({discussion_id: grade_object.discussion_id}, {"_id":1}, function(err, results)
//                {
//                    cbk(err, results);
//                });
                cbk(null, []);
            },

            // 4) calculate suggestion grades
            function(suggestions, cbk){
                //Todo
                cbk(null);
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
        var discussion_thresh;
        var proxy_power = req.user.num_of_given_mandates ? 1 + req.user.num_of_given_mandates * 1/9 : 1;

        //Todo
//        var iterator = function(suggestion, itr_cbk){
//            GradeSuggestion.calculateSuggestionGrade(suggestion._id, object.discussion_id, null, null, discussion_thresh, null, null,function(err, sugg_new_grade, sugg_total_counter){
//                if(!err){
//                    suggestions.push({
//                        _id: suggestion._id,
//                        grade: sugg_new_grade,
//                        evaluators_counter: sugg_total_counter
//                    })
//                }
//                itr_cbk(err, 0);
//            });
//        }

        object.proxy_power = proxy_power;
        self._super(req, object, function(err, grade_object){
            if(err){
                callback(err, null);
            }else{
                var new_grade, evaluate_counter;
                async.waterfall([

                    function(cbk){
                        g_grade = grade_object;

                        //Todo
//                        calculateDiscussionGrade(object.discussion_id, function(err, _new_grade, _evaluate_counter){
//                            new_grade = _new_grade;
//                            evaluate_counter = _evaluate_counter;
//                            cbk(err, 0);
//                        });
                        cbk(null, 0);
                    },

                    //get discussion threshold so i can update every suggestion threshold
                    function(obj, cbk){
                        models.Action.findById(object.action_id, cbk);
                    },

                    function(action_obj,cbk){

                        async.parallel([

                            //set notifications for all users of proxy
                            function(cbk1){
                                //Todo
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
                                //Todo
//                                discussion_thresh = Number(discussion_obj.admin_threshold_for_accepting_change_suggestions) || discussion_obj.threshold_for_accepting_change_suggestions;
//                                models.Suggestion.find({discussion_id: grade_object.discussion_id}, {"_id":1}, function(err, results)
//                                {
//                                    cbk1(err, results);
//                                });
                                cbk1(null, 1000);
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


