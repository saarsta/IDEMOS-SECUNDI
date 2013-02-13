var express = require('express');
var mongoose = require('mongoose');
var util = require('util');
var formage_admin = require('formage-admin');
formage_admin.load_types(mongoose);
formage_admin.register_models(require('./models'));

process.on('uncaughtException', function (err) { console.log(err.stack || err);});

express.logger.token('memory', function () {
    var rss_memory = (process.memoryUsage().rss / 1048576).toFixed(0);
    if (rss_memory > 250) process.nextTick(process.exit);
    return util.format('%dMb', rss_memory);
});
express.logger.format('default2', ':memory :response-time :res[content-length] :status ":method :url HTTP/:http-version" :res[body]');

var mongo_url = process.env.MONGOLAB_URI || 'mongodb://localhost/uru';
var port = process.env.PORT || 80;
var is_only_published = process.env.SHOW_ONLY_PUBLISHED == '1';
var root_path = process.env.ROOT_PATH || 'http://dev.empeeric.com';
var aws_creds = JSON.parse( process.env.AWS_JSON || '{"key": "AKIAJM4EPWE637IGDTQA", "secret": "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", "bucket": "uru"}')

mongoose.connect(mongo_url);
mongoose.connection.on('error', function (err) {console.error('db connection error: ', err);});
mongoose.connection.on('disconnected', function (err) {
    console.error('DB disconnected', err);
    var reconnect = function () {
        mongoose.connect(app.settings.DB_URL, function (err) {
            if (err) {
                console.error(err);
            }
        });
    };
    setTimeout(reconnect, 200);
});

formage_admin.set_amazon_credentials(aws_creds);

var app = module.exports = express();
app.set('port', port);
app.set('show_only_published', is_only_published);
app.set('root_path', root_path);
app.set('DB_URL', mongo_url);
app.set('send_mails', false);
app.set('view options', { layout: false });

formage_admin.serve_static(app, express);
//noinspection JSUnresolvedFunction
app.use('/', [
    express.bodyParser(),
    express.methodOverride(),
    express.cookieParser(),
    express.cookieSession({ secret: '8ntURg0WaIfUkWeQ8ONO' }),
    express.errorHandler(),
    express.logger('default2')
]);

require('./admin')(app);

var server = app.listen(app.get('port'), function (err) {
    if (err) throw err;
    console.log("Express server listening on port %d in %s mode", (server.address() || {}).port, app.get('env'));
});

server.on('error', function (err) {
    console.error('********* Server Is NOT Working !!!! ***************', err);
    setTimeout(process.exit, 5000);
});
