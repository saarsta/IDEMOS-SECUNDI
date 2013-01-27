require('nodetime').profile({
    accountKey: '620cb6d10d2ea43fb3a8e9c0323f31efddb70a10',
    appName: 'URU - ' + process.env.NODE_ENV
});

/**
 * Module dependencies.
 */
var express = require('express');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(express);
var async = require('async');
var utils = require('./utils');
var util = require('util');
var auth = require("connect-auth");


require('./tools/compile_templates');
require('./deliver/tools/compile_dust_templates');

var app = module.exports = express();

app.set('views', __dirname + '/deliver/views');
app.set('public_folder', __dirname + '/deliver/public');

app.set('port', process.env.PORT || 80);

app.set('facebook_app_id', process.env.FACEBOOK_APPID || '175023072601087');
app.set('facebook_app_name',process.env.FACEBOOK_APPNAME || 'uru_dev');
app.set('facebook_secret', process.env.FACEBOOK_SECRET || '5ef7a37e8a09eca5ee54f6ae56aa003f');

app.set('show_only_published', process.env.SHOW_ONLY_PUBLISHED == '1');

app.set('sendgrid_user',process.env.SENDGRID_USER || 'app2952775@heroku.com');

app.set('system_email', process.env.SYSTEM_EMAIL || 'info@uru.org.il');
app.set('sendgrid_key',process.env.SENDGRID_KEY || 'a0oui08x');
app.set('root_path', process.env.ROOT_PATH || 'http://dev.empeeric.com');
app.set('DB_URL',process.env.MONGOLAB_URI || 'mongodb://localhost/uru');
app.set('url2png_api_key', process.env.url2png_api_key || 'P503113E58ED4A');
app.set('url2png_api_secret', process.env.url2png_api_key || 'SF1BFA95A57BE4');

express.logger.token('memory', function(){
    var rss_memory = (process.memoryUsage().rss / 1048576).toFixed(0);
    if (rss_memory > 400) process.nextTick(process.exit);
    return util.format('%dMb', rss_memory);
});
express.logger.format('default2', ':memory :response-time :res[content-length] :status ":method :url HTTP/:http-version"');

app.configure('development', function(){
    app.use(express.errorHandler());
    require('j-forms').setAmazonCredentials({
        key: 'AKIAJM4EPWE637IGDTQA',
        secret: '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',
        bucket: 'uru'
    });

    app.set('send_mails',true);
});


app.configure('staging', function(){
    app.use(express.errorHandler());
    require('j-forms').setAmazonCredentials({
        key: 'AKIAJM4EPWE637IGDTQA',
        secret: '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',
        bucket: 'uru'
    });

    app.set('send_mails',true);

    process.on('uncaughtException', function(err) {
        console.trace(err);
    });
});

app.configure('production', function(){
    app.use(express.errorHandler());
    require('j-forms').setAmazonCredentials({
        key: 'AKIAJM4EPWE637IGDTQA',
        secret: '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',
        bucket: 'uru'
    });

    app.set('send_mails',true);

    process.on('uncaughtException', function(err) {
        console.trace(err);
    });
});

if(!mongoose.connection.host)
    mongoose.connect(app.settings.DB_URL);

mongoose.connection.on('error',function(err) {
    console.error('db connection error: ',err);
});

mongoose.connection.on('disconnected',function(err){
    console.error('DB disconnected',err);
    var reconnect = function(){
        mongoose.connect(app.settings.DB_URL,function(err) {
            if(err)
                console.error(err);
            else {
                session_middleware = express.session({secret: confdb.secret,
                    maxAge: new Date(Date.now() + (3600 * 1000 * 24)),
                    store: new MongoStore(confdb.db) });
            }
        });
    };
    setTimeout(reconnect,200);
});

var models = require('./models');
models.setDefaultPublish(app.settings.show_only_published);

var account = require('./deliver/routes/account');

// Configuration
var confdb = {
    db: utils.split_db_url(app.settings.DB_URL),
    secret: '076ed61d63ea10a12rea879l1ve433s9',
    auto_reconnect:true
};

var session_middleware;

app.configure(function(){
    utils.setShowOnlyPublished(app.settings.show_only_published);

    app.set('view engine', 'jade');

    app.use(express.static(app.settings.public_folder));
    if(app.settings.public_folder2)
        app.use(express.static(app.settings.public_folder2));
    require('j-forms').serve_static(app,express);

    app.use(express.logger('default2'));

    app.use(function(req,res,next) {
        var agent = req.header('User-Agent');
        if(/facebook/.test(agent) || req.query['debug_fb_bot']) {
            require('./deliver/routes/fb_bot')(req,res,next);
        }
        else
            next()
    });

    // pause req stream in case we're uploading files
    app.use(function(req,res,next) {
        if(req.xhr && /api\/(avatar|image_upload)\/?$/.test(req.path)) {
            req.queueStream = new utils.queueStream(req);
            req.queueStream.pause();
            req.pause();
            console.log('request paused');
        }
        next();
    });

    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());

    app.set('view options', { layout: false });

    session_middleware = express.session({secret: confdb.secret,
        maxAge: new Date(Date.now() + (3600 * 1000 * 24)),
        store: new MongoStore(confdb.db) });

    app.use(function(req,res,next) {
        session_middleware(req,res,next);
    });

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
            scope: 'email,publish_actions',
            failedUri: '/noauth'
        })
    ],
    trace: true,
    logoutHandler: require("connect-auth/lib/events").redirectOnLogout("/")}));

    app.use(account.auth_middleware);

    app.use( function(req,res,next) {
        res.locals({
            tag_name: req.query.tag_name,
            logged: req.isAuthenticated && req.isAuthenticated(),
            user_logged: req.isAuthenticated && req.isAuthenticated(),
            user: req.session && req.session.user,
            avatar: (req.session && req.session.avatar_url) || "/images/default_user_img.gif",
            url: req.url,
            meta: {},
        });

        next();
    });

    app.use(express.methodOverride());
    app.use(app.router);

    app.locals({
        footer_links: function(place) {
            var links = mongoose.model('FooterLink').getFooterLinks();
            var non_cms_pages = {'about':1, 'team':1, 'founders':1, 'qa':1};
            var ret = links.filter(function(item) {return item[place];}).map(function(menu) {
                var page_prefix = menu.tab in non_cms_pages ? '/' : '/page/';
                var link = menu.link ? menu.link : (page_prefix + menu.tab);
                return {link:link, name:menu.name};
            })
            return ret;
        },
        cleanHtml: function(html) { return (html || '').replace(/<[^>]*?>/g,'').replace(/\[[^\]]*?]/g,'');},
        fb_description:"עורו היא תנועה חברתית לייצוג הרוב בישראל. אנו מאמינים שבעידן שבו אנו חיים, כולנו מסוגלים וזכאים להשתתף בקבלת ההחלטות. לכן, עורו מנהלת פלטפורמה לדיון ציבורי, יסודי ואפקטיבי שיוביל שינוי בסדר היום. אצלנו, האג'נדה מוכתבת מלמטה.",
        fb_title:'עורו',
        fb_image:'http://site.e-dologic.co.il/philip_morris/Xls_script/uru_mailing/logo.jpg',
        get:function(attr) {
            return app.get(attr);
        }
    });
});


//if(app.settings.env != 'production')
//require('./routes')(app);
require('./api')(app);
require('./admin')(app);
require('./og/config').load(app);
require('./lib/templates').load(app);
if(app.settings.send_mails)
    require('./lib/mail').load(app);
require('./deliver/routes')(app);

var cron = require('./cron');
var common = require('./api/common');

cron.run(app);

async.waterfall([

    function(cbk) {
        async.parallel([
            function(cbk1){
                mongoose.model('FooterLink').load(cbk1);
            },

            function(cbk1){
                mongoose.model('GamificationTokens').findOne(cbk1);
            }
        ], function(err, args){
            cbk(err, args[1]);
        })
    }
    ],
    function(err, gamification) {
        if(err) {
            console.error('init failed');
            console.error(err);
            console.trace();
        }
        else {
            var server = app.listen(app.get('port'),function(err){
                console.log("Express server listening on port %d in %s mode", (server.address()||{}).port, app.get('env'));
            });
            server.on('error', function(err) {
                console.error('********* Server Is NOT Working !!!! ***************',err);
            });
            app.set('gamification_tokens',gamification);
        }
    }
);

