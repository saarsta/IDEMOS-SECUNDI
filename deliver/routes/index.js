var infoAndMeasures = require('./infoAndMeasures'),
    pagesInit = require('./pagesInit'),
    lists = require('./lists'),
    account = require('./account'),
    cycles = require('./cycles'),
    discussion = require('./discussion'),
    Router = require('./router');


module.exports = function(app)
{

    var router = Router.base(app);

    router.get('/', pagesInit.index);

    router.include('/account',account.routing);

    router.get('/signup', function(req, res){
        res.render('signup.ejs',{title:'Signup'});
    });

    router.get('/facebookShare',account.facebookShare);

    router.get('/myuru',pagesInit.myUru);

    router.include('/meida',infoAndMeasures);

    router.include('/discussions',discussion);

    router.get('/cycles/:id', cycles.cyclePageInit);
    router.get('/actions/new',cycles.newAction);
    router.get('/actions/:id',cycles.action);


    router.get('/pendingActions',lists.pendingActions);
    router.get('/actions',lists.actions);
    router.get('/discussions',lists.discussions);
    router.get('/cycles',lists.cycles);

};