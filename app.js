
/**
 * Module dependencies.
 */
var fbId = '175023072601087',
    fbSecret = 'test',
    fbCallbackAddress = 'http://dev.empeeric.com/account/afterSuccessFbConnect2'


var express = require('express'),
    routes = require('./routes'),
    Model = require("./models.js");
    mongoose = require('mongoose'),
    MongoStore  = require('connect-mongo'),
    https = require("https")
    auth = require("connect-auth");

var app = module.exports = express.createServer();


// Configuration
var confdb = {
    db:{
        db: 'uru',
        host: 'localhost',
        port: 27017,  // optional, default: 27017
        //   username: 'admin', // optional
        //    password: 'secret', // optional
        collection: 'Session' // optional, default: sessions
    },
    secret: '076ed61d63ea10a12rea879l1ve433s9'
};

var validatePasswordFunction = function(username, password, successCallback, failureCallback){


    var user_model = mongoose.model('User'),
        flag = false;

    user_model.findOne({user_name: username}, function (err, result){
        if(err == null){
           if(result.password === password){
               successCallback();
           } else{
               failureCallback();
           }
        }else{
            throw "Error reading db.User";
        }
    });
};


app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({secret: confdb.secret,
        maxAge: new Date(Date.now() + 3600000),
        store: new MongoStore(confdb.db) }));
    app.use(auth([
        auth.Basic({validatePassword: validatePasswordFunction}),
        auth.Facebook({
            appId : fbId,
            appSecret: fbSecret,
            callback: fbCallbackAddress,
            scope: 'email',
            failedUri: '/noauth'
        })
    ]));

//    app.use(auth_middleware);

    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));

});

app.configure('development', function(){
  app.set("port", 8003);
  app.set('facebook_app_id', '175023072601087');
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.set("port", 80);
  app.set('facebook_app_id', 'production app id number');
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/test/:id?', routes.test);
app.get('/insertDataBase',function(req, res){
    var user = new Model.User();
    user.first_name = "saar";
    user.gender = "male";
    user.save(function(err){
        if(err != null)
        {
            res.write("error");
            console.log(err);
        }else{
            res.write("done");
        }
        res.end();
    });
});

app.get('/account/afterSuccessFbConnect2', function(req,res){

});


app.post('/account/afterSuccessFbConnect',function(req, res){

    //  console.log(req.body.access_token);
    var access_token = req.body.access_token;
//    var  path =  "https://graph.facebook.com/me?access_token=" + req.body.access_token; //ACCESS_TOKEN
 


    https.get({host:"graph.facebook.com", path: "/me?access_token=" + req.body.access_token }, function (http_res) {
        // initialize the container for our data
        var data = "";
        var session = req.session;

        // this event fires many times, each time collecting another piece of the response
        http_res.on("data", function (chunk) {
            // append this chunk to our growing `data` var
            data += chunk;
        });

        // this event fires *one* time, after all the `data` events/chunks have been gathered
        http_res.on("end", function () {
            // you can use res.send instead of console.log to output via express
            data = JSON.parse(data);
            console.log(data.id);

            var user_facebook_id = data.id;

            isUserInDataBase(user_facebook_id, function(is_user_in_db){
                if(!is_user_in_db){
                    createNewUser(data, req.sessionID);
                }else{
                    updateUesrAccessToken(data);
                }
                //bind session with user facebook id
                session.userFbId = user_facebook_id;
                session.save;
                console.log("session.facebookid =  " + session.userFbId);
            });
        });
    });

    function isUserInDataBase(user_facebook_id, callback){

        var user_model = mongoose.model('User'),
            flag = false;

        user_model.find({facebook_id: user_facebook_id}, function (err, result){
            if(err == null){
                if(result.length == 1){ // its not a new user
                    //var user_id = result[0]._id;
                    //console.log("isUserInDataBase returns true")
                    flag = true;
                }else{
                    if(result.length == 0){ // its a new user
                        //console.log("isUserInDataBase returns false");
                    }else{ // handle error here
                        throw "Error: Too many users with same user_facebook_id";
                    }
                }
            }else{
                throw "Error reading db.User in isNewUser";
            }

            callback(flag);
        });var user_model = mongoose.model('User'),
            flag = false;

        user_model.find({facebook_id: user_facebook_id}, function (err, result){
            if(err == null){
                if(result.length == 1){ // its not a new user
                    //var user_id = result[0]._id;
                    //console.log("isUserInDataBase returns true")
                    flag = true;
                }else{
                    if(result.length == 0){ // its a new user
                        //console.log("isUserInDataBase returns false");
                    }else{ // handle error here
                        throw "Error: Too many users with same user_facebook_id";
                    }
                }
            }else{
                throw "Error reading db.User in isNewUser";
            }

            callback(flag);
        });
    }

    function createNewUser(data){

        var user = new Model.User();
        user.identity_provider = "facebook";
        user.first_name = data.first_name;
        user.last_name = data.last_name;
        user.email = data.email; //there is a problem with email
        user.gender = data.gender;
        user.facebook_id = data.id;
        user.access_token = access_token;
        user.save(function(err){
            if(err != null)
            {
                res.write("error");
                console.log(err);
            }else{
                console.log("done creating new user - " + user.first_name + "" + user.last_name);
                res.write("done creating new user - " + user.first_name + "" + user.last_name);
            }
            res.end();
        });
    }

    function updateUesrAccessToken(data){
        var user_model = mongoose.model('User');

        user_model.findOne({facebook_id: data.id}, function(err, user){
            if (err) { return next(err); }
            user.access_token = access_token;
//            user.session_id = session_id;
            user.save(function(err) {
                if (err) { return next(err); }
            });
        });
    }
});

app.get('/sendmail',function(req, res){
    var nodemailer = require('nodemailer');

// one time action to set up SMTP information
    nodemailer.SMTP = {
        host: 'smtp.gmail.com',
        port: 465,
        ssl: true,
        use_authentication: true,
        user: 'saarsta@gmail.com',
        pass: '*******'
    }

// send an e-mail
    nodemailer.send_mail(
        // e-mail options
        {
            sender: 'saarsta@gmail.com',
            to:'saarsta@gmail.com',
            subject:'Hello!',
            html: '<p><b>Hi,</b> how are you doing?</p>',
            body:'Hi, how are you doing?'
        },
        // callback function
        function(error, success){
            console.log('Message ' + success ? 'sent' : 'failed');
        }

    );

    res.end();

});

var auth_middleware = function(req,res,next)
{
  // if this request needs to be authenticated

    if(req.path in NEED_LOGIN_PAGES)
    {
        if(req.isAuthenticated())
        {
            next();
        }
        else
        {
            res.redirect(LOGIN_PAGE + '?next=' + req.path);
        }
    }
    else
        next();
};

app.post('/register/',function(req,res)
{
    // validate
       validate_new_user(req);
    // create new user
    user = create_new_user(req)//
    req.query['username'] = user.username;
    req.query['password'] = user.password;
    req.authenticate('basic',f);
});

app.post('/login/',function(req,res)
{
   req.authenticate('basic',function(err,is_authenticated)
   {
       if(is_authenticated)
       {
           res.redirect(req.query.next || DEFAULT_LOGIN_REDIRECT);
       }
       else
       {
           // show login failed page
       }
   });
});

var mongoose_resource = require('mongoose-resource');
var rest_api = new mongoose_resource.Api('api',app);
//rest_api.register_resource('users',new UserResource());

app.listen(app.settings.port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
