
/**
 * Module dependencies.
 */


var express = require('express'),
    routes = require('./routes'),
    mongoose = require('mongoose'),
    MongoStore  = require('connect-mongo'),
    auth = require("connect-auth"),
    UserResource = require('./model/UserResources.js'),
    InformationItemResource = require('./model/InformationItemResource.js'),
    ShoppingCartResource = require('./model/ShoppingCartResource'),
    SubjectResource = require('./model/SubjectResource');

var app = module.exports = express.createServer();
var account = require('./routes/account');
var infoAndMeasures = require('./routes/infoAndMeasures');
var selectedSubjectPage = require('./routes/selectedSubjectPage');
var Models = require("./models.js");
var DEFAULT_LOGIN_REDIRECT = '';




app.configure('development', function(){
    app.set("port", 80);
    app.set('facebook_app_id', '175023072601087');
    app.set('facebook_secret', '5ef7a37e8a09eca5ee54f6ae56aa003f');
    app.set('root_path', 'http://dev.empeeric.com');
    app.set('DB_URL','mongodb://localhost/uru');
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.set("port", process.env.PORT);
    app.set('facebook_app_id', '375874372423704');
    app.set('facebook_secret', 'b079bf2df2f7055e3ac3db17d4d2becb');
    app.set('root_path', 'http://uru.herokuapp.com');
    app.set('DB_URL',process.env.MONGOLAB_URI);
    app.use(express.errorHandler());
});

mongoose.connect(app.settings.DB_URL);

function split_db_url(db_url)
{
    var parts = db_url.split('/');
    var conf = {
        db:parts[3],
        collection: 'session',
        clear_interval: 0
    };

    if(parts[2] != 'localhost')
    {
        var middle_part_parts = parts[2].split(':');
        conf['username'] = middle_part_parts[0];
        conf['password'] = middle_part_parts[1].split('@')[0];
        conf['host'] = middle_part_parts[1].split('@')[1];
        conf['port'] = Number(middle_part_parts[2]);
    }
    else
    {
        conf['host'] = 'localhost';
        conf['port'] = 27017;
    }
    return conf;
}
// Configuration
var confdb = {
    db: split_db_url(app.settings.DB_URL),
    secret: '076ed61d63ea10a12rea879l1ve433s9'
};

var fbId = app.settings.facebook_app_id,// '175023072601087',
    fbSecret = app.settings.facebook_secret,// '5ef7a37e8a09eca5ee54f6ae56aa003f',
    fbCallbackAddress = app.settings.root_path + '/account/facebooklogin';

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
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

// Routes


app.get('/', routes.index);
app.get('/test/:id?', routes.test);
app.get('/insertDataBase',function(req, res){
   /* var user = new Model.User();
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
    });*/

    var subject_names = ['Education', 'Economy', 'Sport', 'News', 'Culture', 'Health', 'Food'];
    var tag_names = ['saar', 'guy', 'gay', 'vill', 'maricon', 'wow', 'yeah'];

    for(var i = 0; i < 7; i++ ){
        var subject = new Models.Subject();
        subject.name = subject_names[i];

        if ((i % 3) == 1){
            subject.is_hot = true;
        }
        subject.tags = [tag_names[i], tag_names[(i + 2) % 6], tag_names[(i + 5) % 7]];
        subject.save(function(err){
            if(err != null)
            {
                res.write("error");
                console.log(err);
            }else{
                res.write("done");
            }
            res.end();
        });
    }
});

app.post('/account/register',account.register);
app.all(account.LOGIN_PATH, account.login);
app.get('/account/facebooklogin', account.fb_connect);
app.get('/account/afterSuccessFbConnect2', function(req,res){});
app.get('/needlogin', function(req,res){});
app.get('/account/logout', account.logout);
app.get('/account/meida',infoAndMeasures.meidaInit);
app.get('/selectedSubjectPage', selectedSubjectPage.subjectPageInit);


//app.post('/account/afterSuccessFbConnect', account.fb_connect);

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
rest_api.register_resource('users',new UserResource());
rest_api.register_resource('information_items',new InformationItemResource());
rest_api.register_resource('shopping_cart',new ShoppingCartResource());
rest_api.register_resource('subjects', new SubjectResource());

app.listen(app.settings.port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);



try
{


var mongoose_admin = require('./mongoose-admin/mongoose-admin');

var admin = mongoose_admin.createAdmin(app,{root:'admin'});

admin.ensureUserExists('admin','admin');

admin.registerMongooseModel("User",Models.User,{list:['username','first_name','last_name']});
admin.registerMongooseModel("InformationItem",Models.InformationItem,{list:['title','text_field','users']});
admin.registerMongooseModel("Subject",Models.Subject,{list:['name','image_field']});

}

catch(e)
{
    console.log(e);
    console.log('admin is not operational, wow. exception: ' + e.message);
}