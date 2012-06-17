var Router = require('./router'),
    Navigation = require('./navigation'),
    InformationItems = require('./information_items'),
    Discussions = require('./discussions'),
    Account = require('./account'),
    MyUru= require('./myuru');




module.exports = function(app) {
    var router = Router.base(app);
    router.get('/', Navigation.index);

    router.include('/account',Account.routing);

    router.include('/information_items',InformationItems);

    // TODO remove this (only for backward comp)
    router.include('/meida', InformationItems);

    router.include('/discussions',Discussions);
    router.include('/myuru',MyUru);



};