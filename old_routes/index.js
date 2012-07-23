var infoAndMeasures = require('./infoAndMeasures'),
    pagesInit = require('./pagesInit'),
    lists = require('./lists'),
    account = require('./account'),
    cycles = require('./cycles'),
    discussion = require('./discussion'),
    Router = require('./router'),
    _ = require('underscore');

var OldRouter = Router.extend({
    register_func:function(method,args)
    {
        var self = this;
        var base = this._super;
        var _handler = args[args.length-1];
        var handler = function(req,res)
        {
            var _render = res.render;
            res.render = function(){
                arguments[0] = 'old/' + arguments[0];
                _render.apply(res,arguments);
            };
            _handler.call(null,req,res);
        };
        args[args.length-1] = handler;
        base.call(self,method,args);

        var _base_path = self.base_path;
        self.base_path = '/old' + _base_path;
        base.call(self,method,args);
        self.base_path = _base_path;
    },

    include:function(path,routing_module)
    {
        var self = this;
        var my_router = new OldRouter(this.app,this.build_path(path));
        routing_module(my_router);

        var _base_path = self.base_path;
        self.base_path = '/old' + _base_path;
        var old_router = new OldRouter(this.app,this.build_path(path));
        routing_module(old_router);
        self.base_path = _base_path;

        return my_router;
    }
});


module.exports = function(app)
{

    var router = new OldRouter(app);

    router.get('/', pagesInit.index);

    //router.include('/account',account.routing);

    router.get('/signup', function(req, res){
        res.render('signup.ejs',{title:'Signup'});
    });

    router.get('/facebookShare',account.facebookShare);

    //router.get('/myuru',pagesInit.myUru);
    router.get('/uru/:id',pagesInit.hisUru);

    router.include('/meida',infoAndMeasures);
    router.include('/information_items',infoAndMeasures);

    router.include('/discussions',discussion);

    router.get('/cycles/:id', cycles.cyclePageInit);
    router.get('/actions/new',cycles.newAction);
    router.get('/actions/:id',cycles.action);


    router.get('/pendingActions',lists.pendingActions);
    router.get('/actions',lists.actions);
    router.get('/discussions',lists.discussions);
    router.get('/cycles',lists.cycles);

};