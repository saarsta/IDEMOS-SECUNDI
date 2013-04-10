var mongoose = require('mongoose');

mongoose.connect('mongodb://heroku_app2952775:7eho6cf7a8lhplggsufhrk1fpf@ds051467.mongolab.com:51467/heroku_app2952775');

var formage = require('formage'),
    models = require('../models'),
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