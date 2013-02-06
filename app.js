var express = require('express');
var mongoose = require('mongoose');
var async = require('async');
var util = require('util');
var auth = require("connect-auth");
var logout_handler = require("connect-auth/lib/events").redirectOnLogout("/");
var j_forms = require('formage-admin').forms;
var utils = require('./utils');
var models = require('./models');
var account = require('./deliver/routes/account');
var fb_bot_middleware = require('./deliver/routes/fb_bot/middleware');


express.logger.token('memory', function () {
    var rss_memory = (process.memoryUsage().rss / 1048576).toFixed(0);
    if (rss_memory > 400) process.nextTick(process.exit);
    return util.format('%dMb', rss_memory);
});
express.logger.format('default2', ':memory :response-time :res[content-length] :status ":method :url HTTP/:http-version" :res[body]');

// Static parameters
var DB_URL = process.env.MONGOLAB_URI || 'mongodb://localhost/uru';
var ROOT_PATH = process.env.ROOT_PATH || 'http://dev.empeeric.com';
var is_process_cron = (process.argv[2] == 'cron');
var is_process_web = !is_process_cron;
var s3_creds = {
    key: 'AKIAJM4EPWE637IGDTQA',
    secret: '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',
    bucket: 'uru'
};
var fb_auth_params = {
    appId: process.env.FACEBOOK_APPID || '175023072601087',
    appSecret: process.env.FACEBOOK_SECRET || '5ef7a37e8a09eca5ee54f6ae56aa003f',
    appName: process.env.FACEBOOK_APPNAME || 'uru_dev',
    callback: ROOT_PATH + '/account/facebooklogin',
    scope: 'email,publish_actions',
    failedUri: '/noauth'
};
var auth_middleware = auth({
    strategies: [
        account.SimpleAuthentication(),
        account.FbServerAuthentication(),
        auth.Facebook(fb_auth_params)
    ],
    trace: true,
    logoutHandler: logout_handler
});
// end Static parameters


// Run some compilations
require('./tools/compile_templates');
require('./deliver/tools/compile_dust_templates');


// **** connect to DB ****
if (!mongoose.connection.host) {
    mongoose.connect(DB_URL, {safe: false}, function (db) { console.log("connected to db %s:%s/%s", mongoose.connection.host, mongoose.connection.port, mongoose.connection.name); });
    mongoose.connection.on('error', function (err) { console.error('db connection error: ', err); });
    mongoose.connection.on('disconnected', function (err) {
        console.error('DB disconnected', err);
        setTimeout(function () {mongoose.connect(DB_URL, function (err) { if (err) console.error(err); });}, 200);
    });
}
// ***** end connect to DB *****


var app = module.exports = express();
app.settings['x-powered-by'] = 'Empeeric';
app.set('views', __dirname + '/deliver/views');
app.set('public_folder', __dirname + '/deliver/public');
app.set('port', process.env.PORT || 80);
app.set('facebook_app_id', fb_auth_params.appId);
app.set('facebook_secret', fb_auth_params.appSecret);
app.set('facebook_app_name', fb_auth_params.appName);
app.set('show_only_published', process.env.SHOW_ONLY_PUBLISHED == '1');
app.set('sendgrid_user', process.env.SENDGRID_USER || 'app2952775@heroku.com');
app.set('system_email', process.env.SYSTEM_EMAIL || 'info@uru.org.il');
app.set('sendgrid_key',process.env.SENDGRID_KEY || 'a0oui08x');
app.set('root_path', ROOT_PATH);
app.set('url2png_api_key', process.env.url2png_api_key || 'P503113E58ED4A');
app.set('url2png_api_secret', process.env.url2png_api_key || 'SF1BFA95A57BE4');
app.set('send_mails', true);
app.set('view engine', 'jade');
app.set('view options', { layout: false });



app.use(express.static(app.settings.public_folder));
app.use(express.errorHandler());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.cookieSession({secret: 'Rafdo5L2iyhcsGoEcaBd', cookie: { path: '/', httpOnly: false, maxAge: 60 * 24 * 60 * 60 * 1000}}));
// Add logger after 'static' folders
app.use(express.logger('default2'));
app.use(fb_bot_middleware);
// pause req stream in case we're uploading files
app.use(function (req, res, next) {
    if (req.xhr && /api\/(avatar|image_upload)\/?$/.test(req.path)) {
        req.queueStream = new utils.queueStream(req);
        req.queueStream.pause();
        req.pause();
        console.log('request paused');
    }
    next();
});
app.use(account.referred_by_middleware);
app.use(auth_middleware);
app.use(account.auth_middleware);
app.use(account.populate_user);

app.use(function (req, res, next) {
    res.locals({
        tag_name: req.query.tag_name,
        logged: req.isAuthenticated && req.isAuthenticated(),
        user_logged: req.isAuthenticated && req.isAuthenticated(),
        user: req.user,
        avatar: (req.session && req.session.avatar_url) || "/images/default_user_img.gif",
        url: req.url,
        meta: {}
    });
    next();
});

app.locals({
    footer_links: function (place) {
        var links = mongoose.model('FooterLink').getFooterLinks();
        var non_cms_pages = {'about': 1, 'team': 1, 'founders': 1, 'qa': 1};
        var ret = links.filter(function (item) {return item[place];}).map(function (menu) {
            var page_prefix = menu.tab in non_cms_pages ? '/' : '/page/';
            var link = menu.link ? menu.link : (page_prefix + menu.tab);
            return {link: link, name: menu.name};
        });
        return ret;
    },
    cleanHtml: function (html) { return (html || '').replace(/<[^>]*?>/g, '').replace(/\[[^\]]*?]/g, '');},
    fb_description: "עורו היא תנועה חברתית לייצוג הרוב בישראל. אנו מאמינים שבעידן שבו אנו חיים, כולנו מסוגלים וזכאים להשתתף בקבלת ההחלטות. לכן, עורו מנהלת פלטפורמה לדיון ציבורי, יסודי ואפקטיבי שיוביל שינוי בסדר היום. אצלנו, האג'נדה מוכתבת מלמטה.",
    fb_title: 'עורו',
    fb_image: 'http://site.e-dologic.co.il/philip_morris/Xls_script/uru_mailing/logo.jpg',
    get: function (attr) {
        return app.get(attr);
    }
});

app.configure('development', function(){
    require('./admin')(app);
    j_forms.serve_static(app, express);
    app.set('send_mails', false);
});

app.use(app.router);



require('./api')(app);
require('./og/config').load(app);
require('./lib/templates').load(app);
require('./deliver/routes')(app);
require('./api/common');
if (app.settings.send_mails) require('./lib/mail').load(app);
j_forms.setAmazonCredentials(s3_creds);
models.setDefaultPublish(app.settings.show_only_published);
utils.setShowOnlyPublished(app.settings.show_only_published);



if (is_process_cron) {
    var cron = require('./cron');
    cron.run(app);
}


// run web init
if (is_process_web) {
    async.waterfall([
        function (cbk) {
            mongoose.model('FooterLink').load(cbk);
        },

        function (cbk) {
            mongoose.model('GamificationTokens').findOne(cbk);
        }
    ], function (err, gamification) {
        app.set('gamification_tokens', gamification);
        var server = app.listen(app.get('port'), function (err) {
            if (err) throw err;
            console.log("Express server listening on port %d in %s mode", (server.address() || {}).port, app.get('env'));
        });
        server.on('error', function (err) {
            console.error('********* Server Is NOT Working !!!! ***************\n %s', err);
        });
        process.on('uncaughtException', function (err) {
            console.error(err.stack || err);
        });
    });
}

