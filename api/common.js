var util = require('util');

var jest = require('jest'),
    models = require('../models'),
    fs = require('fs'),
    path = require('path'),
    async = require('async');
var formage = require('formage-admin').forms;

var knox;
try
{
    knox = require('knox');
}
catch(e)
{
}

var ACTION_PRICE = 2;

var user_public_fields = exports.user_public_fields = {
    id: null,
    first_name: null,
    last_name: null,
    avatar_url: null,
    score: null,
    num_of_given_mandates: null,
    num_of_proxies_i_represent: null,
    has_voted: null,
    no_mail_notifications: null  ,
    identity_provider:null
};

var SessionAuthentication = exports.SessionAuthentication = jest.Authentication.extend({
    is_authenticated : function(req, callback){

        //noinspection JSUnresolvedFunction
        var is_auth = req.isAuthenticated();
        if(is_auth)
        {
            var user_id = req.session.user_id;
            if(!user_id){
                callback({message: "no user id"}, null);
            }else{
                models.User.findById(user_id, function(err,user)
                {
                    if(err)
                        callback(err);
                    else
                    {
                        if(!user) {
                            if(req.method != 'GET')
                                callback(null,false);
                            else
                                callback(null,true);
                            return;
                        }
                        req.user = user;
                        // save user last visit
                        // to avoid many updates to the db, don't save if the difference is less than 2 minutes
                        if( !user.last_visit || (new Date() - user.last_visit  > 1000*60*2))
                            models.User.update({_id:user._id},{$set:{last_visit: new Date()}},function(err) {
                                if(err) {
                                    console.error('failed setting last visit',err);
                                }
                                else
                                    console.log('saved last visit');
                            });
                        var is_activated = user.is_activated;
                        var is_suspended = user.is_suspended;

                        if (req.method == 'GET' || (is_activated && !is_suspended))
                            callback(null, true);
                        else {
                            callback({code:401, message: is_suspended ? 'suspended' : 'not_activated'});
                        }
                    }
                });
            }
        }
        else
        {
            if(req.method != 'GET')
                callback(null,false);
            else
                callback(null,true);
        }
    }
});

var TokenAuthorization = exports.TokenAuthorization = jest.Authorization.extend({
    init:function(token_price)
    {
        this.token_price = token_price;
    },

    edit_object : function(req,object,callback){

        if (this.token_price || req.token_price)
        {
            if(req.user.tokens >= (this.token_price || req.token_price)){
                 callback(null, object);
            }else{
                callback({message:"Error: Unauthorized - there is not enought tokens",code:401}, null);
            }
        }
        else
            callback(null,object);
    }
});


var isArgIsInList = exports.isArgIsInList = function(arg_id, collection_list){
    var flag = false;
    for (var i = 0; i < collection_list.length; i++){
        arg_id = arg_id || arg_id.id;
        if (arg_id == collection_list[i].id){
            flag = true;
            break;
        }
    }
    return flag;
};


var score = {};
score.grade = 1;
score.vote = 1;
//score.post = 20;
//score.suggestion = 20;
//score.discussion = 30;

//
//function approve_item (item,item_type,user,callback)
//{
//    update_user_gamification(null,'approved_' + item_type,user,0,callback);
//}

function update_user_gamification(req, game_type, user, price, callback)
{
    var inc_user_gamification ={};
    var inc_user_gamification_score ={};
    inc_user_gamification['gamification.'+game_type] = 1;
    inc_user_gamification['score'] = score[game_type] || 0;

    if(price)
        inc_user_gamification['tokens'] = -price;

        user.gamification = user.gamification || {};
        user.gamification[game_type] = user.gamification[game_type] || 0;
        user.gamification[game_type] += 1;
        user.score += score[game_type];
        if(price)
            user.tokens -= price;
        models.User.update({_id:user.id},{$inc:inc_user_gamification},function(err,num)
        {
            if(err)
                callback(err);
            else
            {
//                async.parallel([
//                    function(cbk){
//                        set_passive_user_updates(req, cbk);
//                    },
//
//                    function(cbk){
//                        check_gamification_rewards(user, cbk);
//
//                    }
//                ], function(err, args){
//                    console.log('user gamification saved');
//                    callback(err, args[1]);
//                })

//                check_gamification_rewards(user, callback);
                callback(err, 0);//TODO change it
                console.log('user gamification saved');

            }
        });
}

function set_passive_user_updates(req, callback){

//    req.update_type = req.update_type || {};
    if(req.update_type){

    }else{
        callback(null, 0);
    }
}

function check_gamification_rewards(user,callback)
{
    //if rewards reurn it
    //+ if perminant reward (king or something) insert to data base the new status

    callback(null,/*reward*/null);
}

function gamification_deserilize(self,base,req,res,obj,status)
{
    if(status == 201 || status == 202 && self.gamification_type || req.gamification_type)
    {
        update_user_gamification(req, self.gamification_type || req.gamification_type, req.user, self.token_price || req.token_price,function(err,rewards)
        {
            if(rewards)
                obj['rewards'] = rewards;

            if (obj)
                obj.updated_user_tokens = req.user.tokens;
            else
            {
                var temp_obj = {}
                    temp_obj.updated_user_tokens = req.user.tokens;
            }
            req.session.user = req.user;
            base(req,res,obj || temp_obj,status);
        });
    }else{
        base(req,res,obj,status);
    }
}

var GamificationResource = exports.GamificationResource  = jest.Resource.extend({
    init:function(type,price)
    {
        this.gamification_type = type;
        this._super();
        this.authorization = new TokenAuthorization(price || 0);
        this.token_price = price;
    },
    deserialize:function(req, res,obj,status)
    {
        gamification_deserilize(this,this._super,req,res,obj,status);
    }
});

var GamificationMongooseResource = exports.GamificationMongooseResource = jest.MongooseResource.extend({
    init:function(model,type,price)
    {
        this.gamification_type = type;
        this._super(model);
        this.authorization = new TokenAuthorization(price || 0);
        this.token_price = price;
    },
    deserialize:function(req, res, obj, status)
    {
        gamification_deserilize(this, this._super, req, res, obj, status);
    }
});

var token_prices = {};
function load_token_prices(){
    models.GamificationTokens.findOne({},function(err,doc)
    {
        if(doc)
            token_prices = doc._doc;
        if(err)
            console.error(err);
    });
};

load_token_prices();

models.GamificationTokens.schema.pre('save',function(next)
{
    setTimeout(load_token_prices, 1000);
    next();
});

exports.getGamificationTokenPrice = function(type)
{
    return token_prices[type] || 0;
};

var threshold_calc_variables = {};
function load_threshold_calc_variables(){
    models.ThresholdCalcVariables.findOne({},function(err,doc)
    {
        if(doc)
            threshold_calc_variables = doc._doc;
        if(err)
            console.error(err);
    });
};

load_threshold_calc_variables();

models.ThresholdCalcVariables.schema.pre('save',function(next)
{
    setTimeout(load_threshold_calc_variables, 1000);
    next();
});

exports.getThresholdCalcVariables = function(type)
{
    return threshold_calc_variables[type] || 0;
};


var uploadHandler = exports.uploadHandler = function(req,callback) {

	var sanitize_filename = function(filename) {
			// This regex matches any character that's not alphanumeric, '_', '-' or '.', thus sanitizing the filename.
			// Hebrew characters are not allowed because they would wreak havoc with the url in any case.
			var regex = /[^-\w_\.]/g;
			return decodeURIComponent(filename).replace(regex, '-');
		},
		filename_to_path = function (filename) {
			return path.join(__dirname,'..','public','cdn', filename);
		},
		create_file = function (filename, callback) {
			// This function attempts to create 0_filename, 1_filename, etc., until it finds a file that doesn't exist.
			// Then it creates that and returns by calling callback(null, name, path, stream);
			var attempt = function (index) {
				var name = index + '_' + filename;
				var path = filename_to_path(name);
				fs.exists(path, function (exists) {
					if (exists) {
						attempt(index + 1);
					} else {
						// File doesn't exist. We can create it
						callback(null, name, path, fs.createWriteStream(path));
					}
				});
			};
			attempt(0);
		},
		writeToFile = function (fName, stream, callback){
			create_file(sanitize_filename(fName), function (err, filename, fullPath, os) {
				if (err) {
					return callback(err);
				}

				stream.on('data',function(data) {
					os.write(data);
				});

				stream.on('end',function() {
					os.on('close', function () {
						callback(null,{
							filename: filename,
							fullPath: fullPath
						});
					});

					os.end();
				});

				stream.resume();
			});
		};

    var knoxClient = formage.fields.getKnoxClient();

    var fName = req.header('x-file-name');
    var fType = req.header('x-file-type');

    if(!fName && !fType){
        callback({code:404,message:'bad file upload'});
        return;
    }

    var stream = req.queueStream || req;

    if(knox && knoxClient)
    {
		// First, we write the file to disk. Then we upload it to Amazon.
        writeToFile(fName, stream, function(err,value) {

            if(err) {
                callback(err);
                return;
            }

            setTimeout(function() {

                var value_full_path = value.fullPath;

                stream = fs.createReadStream(value.fullPath);

                knoxClient.putStream(stream, '/' + value.filename + '_' + (new Date().getTime()), function(err, res){
                    if(err)
                        callback(err);
                    else {
                        var path = res.socket._httpMessage.url;

                        fs.unlink(value_full_path);
                        console.log("res.socket._httpMessage");
                        console.log(res.socket._httpMessage);
                        var value = {
                            path: path,
                            url: path
                        };
                        callback(null,value);
                    }
                });
            },200);
        });
	} else {
		writeToFile(fName, stream, function (err, value) {
			if (err) {
				callback(err);
			} else {
				callback(null, {
					path: value.filename,
					url: '/cdn/' + value.filename
				});
			}
		});
	}
};
