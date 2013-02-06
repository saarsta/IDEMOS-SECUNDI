var express = require('express');
var mongoose = require('mongoose');
var util = require('util');

var app = module.exports = express();

app.set('port', process.env.PORT || 80);
app.set('show_only_published', process.env.SHOW_ONLY_PUBLISHED == '1');

app.set('root_path', process.env.ROOT_PATH || 'http://dev.empeeric.com');
app.set('DB_URL', process.env.MONGOLAB_URI || 'mongodb://localhost/uru');

express.logger.token('memory', function(){
    var rss_memory = (process.memoryUsage().rss / 1048576).toFixed(0);
    if (rss_memory > 250) process.nextTick(process.exit);
    return util.format('%dMb', rss_memory);
});
express.logger.format('default2', ':memory :response-time :res[content-length] :status ":method :url HTTP/:http-version" :res[body]');

app.use(express.errorHandler());
require('j-forms').setAmazonCredentials({
    key: 'AKIAJM4EPWE637IGDTQA',
    secret: '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',
    bucket: 'uru'
});

app.set('send_mails', false);

process.on('uncaughtException', function(err) {
    console.trace(err);
});

if(!mongoose.connection.host)
    mongoose.connect(app.settings.DB_URL);

mongoose.connection.on('error', function(err) {
    console.error('db connection error: ', err);
});

mongoose.connection.on('disconnected', function(err){
    console.error('DB disconnected', err);
    var reconnect = function(){
        mongoose.connect(app.settings.DB_URL, function(err) {
            if(err)
                console.error(err);
        });
    };
    setTimeout(reconnect, 200);
});

require('j-forms').serve_static(app, express);

app.use(express.logger('default2'));

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
app.use(express.cookieSession({ secret: '8ntURg0WaIfUkWeQ8ONO' }));

app.set('view options', { layout: false });

require('./admin')(app);

var server = app.listen(app.get('port'),function(err){
    console.log("Express server listening on port %d in %s mode", (server.address() || {}).port, app.get('env'));
});

server.on('error', function(err) {
    console.error('********* Server Is NOT Working !!!! ***************', err);
    setTimeout(process.exit, 5000);
});
