var Router = require('./router'),
    Navigation = require('./navigation'),
    Account = require('./account');


module.exports = function(app) {
    var router = Router.base(app);
    router.get('/', Navigation.index);

    router.include('/account',Account.routing);
};