
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
    DiscussionShoppingCartResource = require('./model/DiscussionShoppingCartResource'),
    SubjectResource = require('./model/SubjectResource');
    DiscussionResource = require('./model/DiscussionResource.js');
    PostResource = require('./model/PostResource.js');
    VoteResource = require('./model/VoteResource');
    GradeResource = require('./model/GradeResource');
    LikeResource = require('./model/LikeResource');
    JoinResource = require('./model/JoinResource');
    CategoryResource = require('./model/CategoryResource'),
    SuggestionResource = require('./model/suggestionResource.js'),
    ActionResourceResource = require('./model/ActionResourceResource'),
    ActionResource = require('./model/ActionResource'),
    CycleResource = require('./model/CycleResource'),
    ArticleResource = require('./model/ArticleResource').ArticleResource,
    TagResource = require('./model/TagResource'),
    ArticleCommentResource = require('./model/ArticleResource').ArticleCommentResource;

var app = module.exports = express.createServer();
var account = require('./routes/account');
var infoAndMeasures = require('./routes/infoAndMeasures');
var selectedSubjectPage = require('./routes/selectedSubjectPage');
var pagesInit = require('./routes/pagesInit');
var circles = require('./routes/circles');
var mmSearch = require('./routes/mmSearch'),
    i18n = require('i18n-mongoose'),
    locale = require('./locale');
//var cycle = require('./routes/cycle');

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
    require('j-forms').setAmazonCredentials({
        key: 'AKIAJM4EPWE637IGDTQA',
        secret: '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',
        bucket: 'uru'
    });
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

i18n.configure({});

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({secret: confdb.secret,
        maxAge: new Date(Date.now() + 3600000),
        store: new MongoStore(confdb.db) }));
    app.use(account.referred_by_middleware)
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


   /* var DONT_NEED_LOGIN_PAGES = [/^\/images/,/^\/css/, /stylesheets\/style.css/,/favicon.ico/,/account\/login/,/account\/register/,
        /facebookconnect.html/, /account\/afterSuccessFbConnect/,/account\/facebooklogin/,
        /api\/subjects/,/^\/admin/, /^\/api\//];//TODO - change it to global*/

    app.use(account.auth_middleware);
    app.use(express.methodOverride());
    app.use(i18n.init);
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));

    require('j-forms').serve_static(app,express);
});

// register helpers for use in templates
app.helpers({
    __i: i18n.__,
    __n: i18n.__n
});

// Routes

app.get('/', routes.index);

app.post('/account/register',account.register);

app.all(account.LOGIN_PATH, account.login);
app.get('/signup', function(req, res){
    res.render('signup.ejs',{title:'Signup'});
});
app.get('/account/facebooklogin', account.fb_connect);
app.get('/account/afterSuccessFbConnect2', function(req,res){});
app.get('/needlogin', function(req,res){});
app.get('/account/logout', account.logout);
app.get('/meida',pagesInit.meidaInit);
app.get('/selectedSubjectPage', pagesInit.subjectPageInit);
app.get('/selectedItem', pagesInit.selectedItemInit);
app.get('/createDiscussion', pagesInit.createDiscussionPageInit);
app.get('/discussion', pagesInit.discussionPageInit);
app.get('/discussionPreview', pagesInit.discussionPreviewPageInit);
app.get('/cycle', pagesInit.cyclePageInit);
app.get('/mmSearch', mmSearch.mm_search)
app.get('/allDiscussions',pagesInit.allDiscussions);
app.get('/pendingActionsCircle',circles.pendingActions);
app.get('/actionsCircle',circles.actions);
app.get('/discussionsCircle',circles.discussions);
app.get('/circlesCircle',circles.circles);


app.get('/actionListTestData',circles.actionsTestData);
app.get('/discussionListTestData',circles.discussionsTestData);
app.get('/circleListTestData',circles.circlesTestData);



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

var mongoose_resource = require('jest');
var rest_api = new mongoose_resource.Api('api',app);
rest_api.register_resource('users',new UserResource());
rest_api.register_resource('information_items',new InformationItemResource());
rest_api.register_resource('shopping_cart',new ShoppingCartResource());
rest_api.register_resource('discussions_shopping_cart',new DiscussionShoppingCartResource());
rest_api.register_resource('subjects', new SubjectResource());
rest_api.register_resource('discussions', new DiscussionResource());
rest_api.register_resource('posts', new PostResource());
rest_api.register_resource('votes', new VoteResource());
rest_api.register_resource('grades', new GradeResource());
rest_api.register_resource('likes', new LikeResource());
rest_api.register_resource('joins', new JoinResource());
rest_api.register_resource('suggestions', new SuggestionResource());
rest_api.register_resource('categories', new CategoryResource());
rest_api.register_resource('action_resources', new ActionResourceResource());
rest_api.register_resource('actions', new ActionResource());
rest_api.register_resource('cycles', new CycleResource());
rest_api.register_resource('articles', new ArticleResource());
rest_api.register_resource('tags', new TagResource());
rest_api.register_resource('article_update', new ArticleCommentResource());
//rest_api.register_resource('resource_obligations', new ResourceObligation())
;
app.listen(app.settings.port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

try
{
require('j-forms').forms.set_models(Models);

var mongoose_admin = require('admin-with-forms');

var admin = mongoose_admin.createAdmin(app,{root:'admin'});

admin.ensureUserExists('admin','admin');

admin.registerMongooseModel("User",Models.User,null,{list:['username','first_name','last_name']});
admin.registerMongooseModel("InformationItem",Models.InformationItem, null,{list:['title'],order_by:['gui_order'],sortable:'gui_order',cloneable:true});
admin.registerMongooseModel("Subject",Models.Subject,null,{list:['name'],order_by:['gui_order'],sortable:'gui_order'});
admin.registerMongooseModel("Discussion",Models.Discussion,null,{list:['title'],cloneable:true});
admin.registerMongooseModel("Cycle",Models.Cycle,null,{list:['title'],cloneable:true});
admin.registerMongooseModel("Action",Models.Action,null,{list:['title'],cloneable:true});
admin.registerMongooseModel('Locale',locale.Model, locale.Model.schema.tree,{list:['locale'],form:locale.LocaleForm});



}

catch(e)
{
    console.log(e);
    console.log('admin is not operational, wow. exception: ' + e.message);
}

var cron = require('./cron');

require('./compile_templates');
