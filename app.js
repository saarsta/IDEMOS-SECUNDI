'use strict';

require('./lib/memory');

var express = require('express');
var util = require('util');
var utils = require('./utils');
var mongoose = require('mongoose');
var async = require('async');
var domain = require('domain');
var auth = require("connect-auth");
var formage_admin = require('formage-admin');
formage_admin.forms.loadTypes(mongoose);



var app = module.exports = express();
app.set('show_only_published', process.env.SHOW_ONLY_PUBLISHED == '1');
utils.setShowOnlyPublished(app.settings.show_only_published);

var logout_handler = require("connect-auth/lib/events").redirectOnLogout("/");
var account = require('./deliver/routes/account');
var fb_bot_middleware = require('./deliver/routes/fb_bot/middleware');

// ########### Static parameters ###########
var IS_ADMIN = ~(process.env['NODE_ENV'] || []).indexOf('admin');
var DB_URL = process.env['MONGOLAB_URI'] || 'mongodb://localhost/uru';
var ROOT_PATH = process.env.ROOT_PATH || 'http://dev.empeeric.com';
var IS_PROCESS_CRON = (process.argv[2] === 'cron');
var IS_PROCESS_WEB = !IS_PROCESS_CRON;
var s3_creds = {
    key: 'AKIAJM4EPWE637IGDTQA',
    secret: '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',
    bucket: 'uru'
};
var fb_auth_params = {
    appId: process.env['FACEBOOK_APPID'] || '175023072601087',
    appSecret: process.env['FACEBOOK_SECRET'] || '5ef7a37e8a09eca5ee54f6ae56aa003f',
    appName: process.env['FACEBOOK_APPNAME'] || 'uru_dev',
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
// ########### Static parameters ###########


// Run some compilations
require('./tools/compile_templates');
require('./deliver/tools/compile_dust_templates');



// ######### connect to DB #########
if (!mongoose.connection.host) {
    mongoose.connect(DB_URL, {safe: true}, function (db) { console.log("connected to db %s:%s/%s", mongoose.connection.host, mongoose.connection.port, mongoose.connection.name); });
    mongoose.connection.on('error', function (err) { console.error('db connection error: ', err); });
    mongoose.connection.on('disconnected', function (err) {
        console.error('DB disconnected', err);
        setTimeout(function () {mongoose.connect(DB_URL, function (err) { if (err) console.error(err); });}, 200);
    });
}
// ######### end connect to DB #########



// ######### settings #########

app.settings['x-powered-by'] = 'Empeeric';
app.set('views', __dirname + '/deliver/views');
app.set('public_folder', __dirname + '/deliver/public');
app.set('port', process.env.PORT || 80);
app.set('facebook_app_id', fb_auth_params.appId);
app.set('facebook_secret', fb_auth_params.appSecret);
app.set('facebook_app_name', fb_auth_params.appName);
app.set('facebook_pages_admin_user', "uri@uru.org.il");
app.set('facebook_pages_admin_pass', "uruuruuru");
app.set('sendgrid_user', process.env.SENDGRID_USER || 'app2952775@heroku.com');
app.set('system_email', process.env.SYSTEM_EMAIL || 'admin@uru.org.il');
app.set('sendgrid_key',process.env.SENDGRID_KEY || 'a0oui08x');
app.set('root_path', ROOT_PATH);
app.set('url2png_api_key', process.env.url2png_api_key || 'P503113E58ED4A');
app.set('url2png_api_secret', process.env.url2png_api_key || 'SF1BFA95A57BE4');
app.set('send_mails', true);
app.set('view engine', 'jade');
app.set('view options', { layout: false });
formage_admin.forms.setAmazonCredentials(s3_creds);

var models = require('./models');
models.setDefaultPublish(app.settings.show_only_published);
// ######### settings #########



// ######### error handling #########
process.on('uncaughtException', function(err) {
    console.error('*************************  unhandled exception !!!!! ********************************');
    console.error(err);
    console.error(err.stack);
});
app.use(function (req, res, next) {
    var d = domain.create();
    d.add(req);
    d.add(res);
    d.on('error', function (err) {
        console.error("#### domain exception ####\n%s\n#### end ####", err.stack || err);
        try {
            res.send(500, err.stack || err);
        } catch (e) {
            res.end();
        }
    });
    d.enter();
    next();
});
// ######### error handling #########



// ######### general middleware #########
formage_admin.serve_static(app, express);
app.use(express.compress());
app.use(express.static(app.settings.public_folder));
app.use(express.errorHandler());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.cookieSession({secret: 'Rafdo5L2iyhcsGoEcaBd', cookie: { path: '/', httpOnly: false, maxAge: 60 * 24 * 60 * 60 * 1000}}));
// ######### general middleware #########



// ########### Add request memory logger after 'static' folders ###########
express.logger.token('mem', function () { var p = process, r_mem = (p.memoryUsage().rss / 1048576).toFixed(0); if (r_mem > 400) p.nextTick(p.exit); return util.format('%dMb', r_mem); });
express.logger.format('default2', ':mem :response-time :res[content-length] :status ":method :url HTTP/:http-version" :res[body]');
app.use(express.logger('default2'));
// ########### setup memory logging ###########



// ######### specific middleware #########
app.use(fb_bot_middleware);
app.use(account.referred_by_middleware);
app.use(auth_middleware);
app.use(account.auth_middleware);
app.use(account.populate_user);
// ######### specific middleware #########



// ######### locals #########
app.use(function (req, res, next) {
    //noinspection JSUnresolvedVariable
    res.locals({
        tag_name: req.query.tag_name,
        logged: req.isAuthenticated && req.isAuthenticated(),
        user_logged: req.isAuthenticated && req.isAuthenticated(),
        user: req.user,
        avatar: (req.session && req.session.avatar_url) || "/images/default_user_img.gif",
        url: req.url,
        meta: {},
        is_dev: true /*app.settings.env == 'development' || app.settings.env == 'staging'*/
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


app.locals({
    writeHead: function(name) {
        var isDev = app.settings.env == 'development' || app.settings.env == 'staging';
        function headFromSrc(src, type) {
            switch (type) {
                case 'js':
                    return '<script src="' + src + '" type="text/javascript"></script>';
                case 'css':
                    return '<link href="' + src + '" rel="stylesheet" type="text/css"/>';
                default:
                    throw new Error('unknown type ' + type);
            }
        }
        var conf = require('./conf.js').headConfigs[name];
        var type = conf.type;
        if (isDev)
            return _.map(conf.src,
                function (src) {
                    return headFromSrc(src, type);
                }).join('\n');
        else {
            var final = conf.final || ( conf.min === false || type == 'css' ? '/dist/' + type + '/' + conf.name + '.' + type : '/dist/' + type + '/' + conf.name + '.min.' + type);
            return headFromSrc(final, type);
        }
    }
});
// ######### locals #########



// ######### environment specific settings #########
app.configure('development', function(){
    require('./admin')(app);
    app.set('send_mails', false);
});

if (IS_ADMIN) {
    require('./admin')(app);
}
if (!IS_ADMIN && IS_PROCESS_WEB) {
    require('./api')(app);
    require('./og/config').load(app);
    require('./lib/templates').load(app);
    require('./deliver/routes')(app);
    require('./api/common');
}
if (app.settings.send_mails) {
    require('./lib/mail').load(app);
}
if (IS_PROCESS_CRON) {
    var cron = require('./cron');
    cron.run(app);
}


// ######### environment specific settings #########



// run web init
if (IS_PROCESS_WEB) {
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
            if (err) {
                console.error(err.stack || err);
                process.exit(1);
            }
            console.log("Express server listening on port %d in %s mode", (server.address() || {}).port, app.get('env'));
        });
        server.on('error', function (err) {
            console.error('********* Server Is NOT Working !!!! ***************\n %s', err);
        });
    });
}


