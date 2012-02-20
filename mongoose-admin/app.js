var express = require('express'),
    mongoose = require('mongoose'),
    MongoStore  = require('connect-mongo'),
    auth = require("connect-auth");


mongoose.connect("mongodb://localhost/admin_test");
var app = module.exports = express.createServer();

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
    db: split_db_url("mongodb://localhost/admin_test"),
    secret: '076ed6sda3ea10a12rea879l1ve433s9'
};

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({secret: confdb.secret,
        maxAge: new Date(Date.now() + 3600000),
        store: new MongoStore(confdb.db) }));
    app.use(auth({strategies: [],
        trace: true,
        logoutHandler: require("connect-auth/lib/events").redirectOnLogout("/account/login")}));

    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

var mongoose_admin = require('./mongoose-admin');

var admin = mongoose_admin.createAdmin(app,{root:'admin'});

var Book = mongoose.model('Book',new mongoose.Schema({
    name:String,
    price:Number
}));

admin.registerMongooseModel('Book',Book,{list:['name','price'],sort:['name','price']});

admin.ensureUserExists('admin','admin');

app.listen(80);

console.log('I have created admin');