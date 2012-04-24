var infoAndMeasures = require('./infoAndMeasures'),
    pagesInit = require('./pagesInit'),
    lists = require('./lists'),
    account = require('./account'),
    cycles = require('./cycles'),
    discussion = require('./discussion');

module.exports = function(app)
{



    app.get('/', pagesInit.index);

    app.post('/account/register',account.register);

    app.all(account.LOGIN_PATH, account.login);
    app.get('/signup', function(req, res){
        res.render('signup.ejs',{title:'Signup'});
    });

    app.get('/account/facebooklogin', account.fb_connect);
    app.get('/account/logout', account.logout);
    app.get('/facebookShare',account.facebookShare);

    app.get('/myuru',pagesInit.myUru);

    app.get('/meida',infoAndMeasures.meidaInit);
    app.get('/meida/subject/:id', infoAndMeasures.subjectPageInit);
    app.get('/meida/:id', infoAndMeasures.selectedItemInit);

    app.get('/discussions/new', discussion.createDiscussionPageInit);
    app.get('/discussions/:id/preview', discussion.discussionPreviewPageInit);
    app.get('/discussions/:id', discussion.discussionPageInit);

    app.get('/cycles/:id', cycles.cyclePageInit);
    app.get('/actions/new',cycles.newAction);
    app.get('/actions/:id',cycles.action);


    app.get('/pendingActions',lists.pendingActions);
    app.get('/actions',lists.actions);
    app.get('/discussions',lists.discussions);
    app.get('/cycles',lists.cycles);

};