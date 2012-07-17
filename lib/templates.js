var fs = require('fs')
    ,path = require('path')
    ,ejs = require('ejs');

var app;
exports.load = function(_app) {
    app = _app;
};


exports.renderTemplate = function(template, context,callback) {
    fs.readFile(path.join(__dirname,'..','deliver','views','mails',template+'.ejs'),'utf8', function (err, data) {
        if (err)
            callback(err);
        else {
            context = context || {};
            context.settings = app.settings;
            var message = ejs.render(data,context);
            callback(null,message);
        };
    });
};