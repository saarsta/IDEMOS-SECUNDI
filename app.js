
/**
 * Module dependencies.
 */
var express = require('express'),
    mongoose = require('mongoose'),
    MongoStore  = require('connect-mongo'),
    async = require('async'),
    auth = require("connect-auth");

var app = module.exports = express.createServer();


app.configure('development', function(){
    app.set('views', __dirname + '/deliver/views');
    app.set('old_views', __dirname + '/views');
    app.set('public_folder', __dirname + '/deliver/public');
    app.set('public_folder2', __dirname + '/public');
    app.set('port',80);
    app.set('facebook_app_id', '175023072601087');
    app.set('facebook_app_name','uru_dev');
    app.set('facebook_secret', '5ef7a37e8a09eca5ee54f6ae56aa003f');

    app.set('show_only_published',false);

//    app.set('facebook_app_id', '436675376363069');
//    app.set('facebook_app_name','uru_staging');
//    app.set('facebook_secret', '975fd0cb4702a7563eca70f11035501a');

    app.set('sendgrid_user','app2952775@heroku.com');
    app.set('sendgrid_key','a0oui08x');
    app.set('system_email','info@uru.org.il');
    app.set('root_path', 'http://dev.empeeric.com');
    app.set('DB_URL','mongodb://localhost/uru');
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    require('./tools/compile_templates');
    require('./deliver/tools/compile_dust_templates');
});


app.configure('avner_env', function(){
    app.set('views', __dirname + '/deliver/views');
    app.set('old_views', __dirname + '/views');
    app.set('public_folder', __dirname + '/deliver/public');
    app.set('public_folder2', __dirname + '/public');
    app.set('port',3000);
    app.set('facebook_app_id', '175023072601087');
    app.set('facebook_app_name','uru_dev');
    app.set('facebook_secret', '5ef7a37e8a09eca5ee54f6ae56aa003f');

    app.set('show_only_published',false);

//    app.set('facebook_app_id', '436675376363069');
//    app.set('facebook_app_name','uru_staging');
//    app.set('facebook_secret', '975fd0cb4702a7563eca70f11035501a');

    app.set('sendgrid_user','app2952775@heroku.com');
    app.set('sendgrid_key','a0oui08x');
    app.set('system_email','info@uru.org.il');
    app.set('root_path', 'http://dev.empeeric.com');
    app.set('DB_URL','mongodb://localhost/uru');
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    require('./tools/compile_templates');
    require('./deliver/tools/compile_dust_templates');
});



app.configure('staging', function(){
    app.set('views', __dirname + '/deliver/views');
    app.set('old_views', __dirname + '/views');
    app.set('public_folder', __dirname + '/deliver/public');
    app.set('public_folder2', __dirname + '/public');
    app.set("port", process.env.PORT);
    app.set('facebook_app_id', '436675376363069');
    app.set('facebook_app_name','uru_staging');
    app.set('facebook_secret', '975fd0cb4702a7563eca70f11035501a');

    app.set('show_only_published',false);

    app.set('sendgrid_user',process.env.SENDGRID_USERNAME || 'app2952775@heroku.com');
    app.set('sendgrid_key',process.env.SENDGRID_PASSWORD || 'a0oui08x');
    app.set('system_email','info@uru.org.il');
    app.set('root_path', 'http://uru-staging.herokuapp.com');
    app.set('DB_URL',process.env.MONGOLAB_URI);
    app.use(express.errorHandler());
    require('j-forms').setAmazonCredentials({
        key: 'AKIAJM4EPWE637IGDTQA',
        secret: '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',
        bucket: 'uru'
    });
    require('./deliver/tools/compile_dust_templates');
    require('./tools/compile_templates');
});

app.configure('production', function(){
    app.set('views', __dirname + '/deliver/views');
    app.set('old_views', __dirname + '/views');
    app.set('public_folder', __dirname + '/deliver/public');
    app.set('public_folder2', __dirname + '/public');
    app.set("port", process.env.PORT);
    app.set('facebook_app_id', '375874372423704');
    app.set('facebook_app_name','uru_heroku');
    app.set('facebook_secret', 'b079bf2df2f7055e3ac3db17d4d2becb');

    app.set('show_only_published',true);

    app.set('sendgrid_user',process.env.SENDGRID_USERNAME || 'app2952775@heroku.com');
    app.set('sendgrid_key',process.env.SENDGRID_PASSWORD || 'a0oui08x');
    app.set('system_email','info@uru.org.il');
    app.set('root_path', 'http://www.uru.org.il');
    app.set('DB_URL',process.env.MONGOLAB_URI);
    app.use(express.errorHandler());
    require('j-forms').setAmazonCredentials({
        key: 'AKIAJM4EPWE637IGDTQA',
        secret: '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',
        bucket: 'uru'
    });
    require('./deliver/tools/compile_dust_templates');
    require('./tools/compile_templates');

});

mongoose.connect(app.settings.DB_URL);

var models = require('./models');
models.setDefaultPublish(app.settings.show_only_published);

var account = require('./deliver/routes/account');

// Configuration
var confdb = {
    db: require('./utils').split_db_url(app.settings.DB_URL),
    secret: '076ed61d63ea10a12rea879l1ve433s9'
};

app.configure(function(){
    require('./utils').setShowOnlyPublished(app.settings.show_only_published);

    app.set('view engine', 'jade');

    app.use(express.static(app.settings.public_folder));
    if(app.settings.public_folder2)
        app.use(express.static(app.settings.public_folder2));
    require('j-forms').serve_static(app,express);


    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());

    app.set('view options', { layout: false });

    app.use(express.session({secret: confdb.secret,
        maxAge: new Date(Date.now() + (3600 * 1000 * 24 * 4)),
        store: new MongoStore(confdb.db) }));
    app.use(account.referred_by_middleware);

    var fbId = app.settings.facebook_app_id,
        fbSecret = app.settings.facebook_secret,
        fbCallbackAddress = app.settings.root_path + '/account/facebooklogin';

    app.use(auth({strategies: [
        account.SimpleAuthentication()
        ,account.FbServerAuthentication()
        ,auth.Facebook({
            appId : fbId,
            appSecret: fbSecret,
            callback: fbCallbackAddress,
            scope: 'email',
            failedUri: '/noauth'
        })
    ],
    trace: true,
    logoutHandler: require("connect-auth/lib/events").redirectOnLogout("/")}));

    app.use(account.auth_middleware);
    app.use(express.methodOverride());
    app.use(app.router);

});

//if(app.settings.env != 'production')
//require('./routes')(app);
require('./api')(app);
require('./admin')(app);
require('./og/config').load(app);
require('./lib/templates').load(app);
require('./lib/mail').load(app);
require('./deliver/routes')(app);

var cron = require('./cron');
cron.run(app);

async.waterfall([
        function(cbk) {
            mongoose.model('FooterLink').load(cbk);
        }
    ],
    function(err) {
        if(err) {
            console.error('init failed');
            console.error(err);
            console.trace();
        }
        else {
            app.helpers({
                footer_links:function() { return mongoose.model('FooterLink').getFooterLinks(); }
            });
            app.dynamicHelpers({
                tag_name: function(req,res) { return req.query.tag_name; },
                logged: function(req,res) { return req.isAuthenticated(); },
                user_logged:function(req,res) { return req.isAuthenticated(); },
                user: function(req,res) { return req.session.user; },
                avatar: function(req,res) { return req.session.avatar_url; },
                url:function(req,res) { return req.url; }
            });
            app.listen(app.settings.port);
            console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
        }
    }
);

