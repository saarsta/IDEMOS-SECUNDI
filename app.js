
/**
 * Module dependencies.
 */
var fbId = '175023072601087',
    fbSecret = 'test',
    fbCallbackAddress = 'http://dev.empeeric.com/account/afterSuccessFbConnect2'


var express = require('express'),
    routes = require('./routes'),
    mongoose = require('mongoose'),
    MongoStore  = require('connect-mongo'),
    auth = require("connect-auth");

var app = module.exports = express.createServer();
var account = require('./routes/account');



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

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({secret: confdb.secret,
        maxAge: new Date(Date.now() + 3600000),
        store: new MongoStore(confdb.db) }));
    app.use(auth({strategies: [
        account.SimpleAuthentication()
        ,auth.Facebook({
            appId : fbId,
            appSecret: fbSecret,
            callback: fbCallbackAddress,
            scope: 'email',
            failedUri: '/noauth'
        })
    ],
    trace: true,
    logoutHandler: require("connect-auth/lib/events").redirectOnLogout("/acount/login")}));

    app.use(account.auth_middleware);

    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));

});

app.configure('development', function(){
  app.set("port", 80);
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
app.post('/account/register',account.register);

//app.all('/account/login', function(req, res){
//    console.log(req.method);
//
//    switch(req.method){
//        case "GET":
//            res.render('login',{title:'Login'});
//            break;
//        case "POST":
//            res.send("POST");
//        default:
//            res.send('');
//    }
//});

app.all(account.LOGIN_PATH, account.login);
//app.post('account/test', account.login);

app.get('/account/afterSuccessFbConnect2', function(req,res){

});


app.get('/needlogin', function(req,res){

});
app.get('/account/logout', account.logout);


app.post('/account/afterSuccessFbConnect', account.fb_connect);

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

var mongoose_resource = require('mongoose-resource');
var rest_api = new mongoose_resource.Api('api',app);
//rest_api.register_resource('users',new UserResource());

app.listen(/*app.settings.port*/80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
