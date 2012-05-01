var models = require('../models.js');

module.exports = function(router)
{
    router.get('/new', function(req, res){
        models.Subject.findById(req.query.subject_id,function(err,subject)
        {
            res.render('createDiscussion.ejs',{title:"יצירת דיון", logged: req.isAuthenticated(),
                big_impressive_title: "",
                subject:subject,
                user: req.session.user,
                avatar:req.session.avatar_url,
                tab:'discussions'
            });
        });
    });

    router.get('/:id', function(req, res){
        models.Discussion.findById(req.params.id, function(err, discussion){
            res.render('discussionPage.ejs',{
                layout: false,
                title:"דיון",
                logged: req.isAuthenticated(),
                discussion_id: req.params.id,
                subject_id: req.query.subject_id,
                big_impressive_title: req.query.subject_name,
                user: req.session.user,
                avatar:req.session.avatar_url,
                tab:'discussions',
                discussion: discussion,
                url: req.url,
                extra_head:'<script src="/javascripts/discussionPage.js"></script>'});
        });
    });

    router.get('/:id/preview', function(req, res){

        res.render('discussionPreviewPage.ejs',{title:'discussionPreviewPageInit.ejs',
            discussion_id: req.params.id,
            subject_id: req.query.subject_id,
            tab:'discussions',
            subject_name: req.query.subject_name});

    });

};

