var _ = require('underscore');

var routes = [
    {
        rule: /discussions\/([0-9a-fA-F]+)\/posts\/([0-9a-fA-F]+)/,
        handler: require('./discussion_post')
    }
]

module.exports = function(req,res,next) {
    console.log('***************************************************************************************');

    console.log('facebook bot');

    console.log(req.url);
    console.log('***************************************************************************************');

    var match;

    var rule = _.find(routes,function(route) {
        match = route.rule.exec(req.url);
        return match;
    });

    if( rule)
        rule.handler(req, res, match);
    else
       next();
};