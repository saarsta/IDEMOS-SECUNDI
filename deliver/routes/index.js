var Router = require('./router'),
    Navigation = require('./navigation'),
    InformationItems = require('./information_items'),
    Discussions = require('./discussions'),
    Account = require('./account'),
    MyUru= require('./myuru');
  //  HisUru= require('./hisuru') ;




module.exports = function(app) {
    var router = Router.base(app);

    router.include('',Navigation) ;

    router.include('/account',Account.routing);

    router.all('/facebook',require('./account/facebook'));

    router.all('/facebookShare',require('./account/facebook_share'));

    router.include('/information_items',InformationItems);

    router.include('/blogs',require('./blogs'));

    router.include('/cycles', require('./cycles'));

    router.include('/updates', require('./updates'));

    router.include('/actions', require('./actions'));

    router.include('./pending_actions',require('./pending_actions'));

    // TODO remove this (only for backward comp)
    router.include('/meida', InformationItems);

    router.include('/discussions',Discussions);

    router.include('/myuru',MyUru);

   // router.include('/hisuru',MyUru);
  //  router.include('/hisuru',HisUru);

    router.include('/og', require('../../og'));

    router.post('/elections/vote',require('./elections/vote'));

    //router.get('/elections/fbimage',require('./elections/fbimage'));

    router.all('/elections/fbimage/:id', require('./elections/fbimage'));

//    router.all(/.*/,function(req,res) {
//        res.render('404.ejs',{});
//    });

};