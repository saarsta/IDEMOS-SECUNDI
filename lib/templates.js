var fs = require('fs')
    ,path = require('path')
    ,ejs = require('ejs');

var app;
exports.load = function(_app) {
    app = _app;
};


exports.renderTemplate = function(template, context,callback) {
    fs.readFile(path.join(__dirname,'..','views','mails',template+'.ejs'),'utf8', function (err, data) {
        if (err){
            console.error(err);
            callback(err);
        }
        else {
            context = context || {};
            context.settings = app.settings;
            try{
                var message = ejs.render(data,context);
                callback(null,message);
            }
            catch(ex){
                console.error('rendering html failed for template ' + template);
                callback(ex);
            }
        };
    });
};