var Router = require('./router'),
    Navigation = require('./navigation'),
    InformationItems = require('./information_items'),
    Discussions = require('./discussions'),
    Account = require('./account'),
    AppError = require('./app_error'),
    MyUru= require('./myuru');
  //  HisUru= require('./hisuru') ;




module.exports = function(app) {
    var router = Router.base(app);

    router.include('',Navigation) ;

    router.include('/account',Account.routing);

    router.include('/app_error',AppError.routing);

    router.all('/facebook',require('./account/facebook'));

    router.all('/facebookShare',require('./account/facebook_share'));

    router.all('/elections_only',require('./navigation/elections_only'))

    router.all('/order_shirts',require('./navigation/order_shirts'));

    router.include('/information_items',InformationItems);

    router.include('/blogs',require('./blogs'));

    router.include('/cycles', require('./cycles'));

    router.include('/updates', require('./updates'));

    router.include('/actions', require('./actions'));

    router.include('./pending_actions',require('./pending_actions'));

    router.include('/meida', InformationItems);

    router.include('/discussions',Discussions);

    router.include('/daily_discussions',require('./daily_discussions'));

    router.include('/myuru',MyUru);

    router.include('/og', require('../../og'));

    router.post('/elections/vote',require('./elections/vote'));

    router.all('/elections/fbimage/:id', require('./elections/fbimage'));
};