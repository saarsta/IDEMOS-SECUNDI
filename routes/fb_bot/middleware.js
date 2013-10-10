var _ = require('underscore');

var routes = [
    {
        rule: /discussions\/([0-9a-fA-F]+)\/posts\/([0-9a-fA-F]+)/,
        handler: require('./discussion_post')
    }
];

module.exports = function (req, res, next) {
    var agent = req.header('User-Agent');
    if (!/facebook/.test(agent) && !req.query['debug_fb_bot']) {
        return next();
    }

    console.log('****************************** facebook bot *******************************************');
    console.log(req.url);
    console.log('***************************************************************************************');

    var match = null;
    var rule = _.find(routes, function (route) {
        match = route.rule.exec(req.url);
        return match;
    });

    if (!rule) {
        return next();
    }

    return rule.handler(req, res, match);
};
