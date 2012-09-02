



var mongoose = require('mongoose');

mongoose.connect('mongodb://heroku_app2952775:nuulb7icv8aafrr7n592uie793@ds031107.mongolab.com:31107/heroku_app2952775');

var app = require('../app'),
    models = require('../models'),
    common = require('../deliver/routes/account/common'),
    templates = require('../lib/templates'),
    mail = require('../lib/mail'),
    async = require('async'),
    fs = require('fs');



var filename = process.argv[2] || 'users.csv';


var writer = fs.createWriteStream(filename);

var counter = 0;

var stream = models.User.find().stream();
stream.on('data',function(doc)
{
    console.log('writing ' + counter++);
    var name_parts = (doc.first_name || '').trim().split(/\s+/);
    var first_name = doc.first_name || name_parts[0] || '';
    var last_name = doc.last_name || name_parts.slice(1).join(' ');
    var line = first_name + ',' + last_name + ',' + doc.email;
    writer.write(line.replace(/"/g,''),'utf8');
    writer.write('\n','utf8');
});

stream.on('close',function() {
    writer.end();
    console.log('finished');
});

stream.on('error',function(err) {
    throw err;
});
