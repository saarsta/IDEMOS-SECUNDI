var _ = require('underscore'),
    Navigation = require('./navigation'),
    InformationItems = require('./information_items'),
    Discussions = require('./discussions'),
    Account = require('./account'),
    AppError = require('./app_error'),
    MyUru = require('./myuru');
//  HisUru= require('./hisuru') ;


var router = {
    init: function (app, path) {
        this.app = app;
        this.base_path = path || '';
        var methods = ['get', 'post', 'put', 'delete'];
        var self = this;
        methods.forEach(function (method) {
            self[method] = function (path) {
                this.register_func(this.app[method], arguments)
            };
        });
    },
    all: function () {
        if (typeof(arguments[arguments.length - 1]) == 'object') {
            var funcObject = arguments[arguments.length - 1];
            arguments[arguments.length - 1] = function (req, res) {
                var method = req.method.toLowerCase();
                if (method in funcObject)
                    funcObject[method](req, res);
                else
                    res.send('method not supported', 400);
            };
            this.register_func(this.app.all, arguments);
        }
        else
            this.register_func(this.app.all, arguments);
    },
    register_func: function (func, args) {
        var path = args[0];
        args[0] = this.build_path(path);

        if (this.app.settings.env == 'production') {
            var handler = args[args.length - 1];
            args[args.length - 1] = function (req, res) {
                try {
                    handler.apply(null, arguments);
                }
                catch (ex) {
                    res.render('500.ejs', {error: ex});
                    console.error(ex);
                    console.trace();
                }
            };
        }

        func.apply(this.app, args);
    },
    is_regex: function (path) {
        return typeof(path) == 'object' && typeof(path.source) != 'undefined';
    },
    get_regex_source: function (path) {
        return this.is_regex(path) ? path.source : path;
    },
    concat_regex: function (reg1, reg2) {
        var str1 = this.get_regex_source(reg1);
        var str2 = this.get_regex_source(reg2);
        if (str1[0] != '^')
            str1 = '^' + str1;
        return RegExp(str1 + str2);
    },
    build_path: function (path) {
        if (this.is_regex(path) || this.is_regex(this.base_path))
            return this.concat_regex(this.base_path, path);
        return this.base_path + path;
    },
    include: function (path, routing_module) {
        var sub_router = _.clone(router);
        sub_router.init(router.app, path);
        routing_module(sub_router);
        return sub_router;
    }
};



module.exports = function (app) {
    router.init(app);

    router.include('', Navigation);

    router.include('/account', Account.routing);

    router.include('/mail_settings', require('./mail_settings'));

    router.include('/app_error', AppError.routing);

    router.all('/facebook', require('./account/facebook'));

    router.all('/facebookShare', require('./account/facebook_share'));

    router.include('/information_items', InformationItems);

    router.include('/cycles', require('./cycles'));

    router.include('/updates', require('./updates'));

    router.include('/actions', require('./actions'));

    router.include('./pending_actions', require('./pending_actions'));

    router.include('/meida', InformationItems);

    router.include('/discussions', Discussions);

    router.include('/myuru', MyUru);

    router.include('/og', require('../og'));

    router.all('/smallgov', require('./cycles/main'));//,'508026e8cb2276020000001f'

    router.all('/vote', require('./cycles/main'));//'5098eb8bc492d10200000024'

    router.all('/health', require('./cycles/main'));//'507c39809cba93020000003d'

    router.get('/agra', require('./cycles/main'));

    router.post('/agra', require('./cycles/main'));

    router.include('/facebook_realtime', require('./facebook_realtime'));
};
