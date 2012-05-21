var models = require('../models.js'),
    async = require('async'),
    DiscussionResource = require('../model/DiscussionResource');

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
        var resource = new DiscussionResource();

        async.parallel([
            // get the user object
            function(cbk)
            {
                if(req.session.user)
                    models.User.findById(req.session.user._id,cbk);
                else
                    cbk(null, null);
            },
            // get the discussion object
            function(cbk)
            {
                models.Discussion.findById(req.params.id, cbk);
            }
        ],
        function(err,results)
        {
            if(err)
                res.send(err,500);
            else
            {
                // populate 'is follower' , 'grade object' ...
                resource.get_discussion(results[1],results[0],function(err,discussion)
                {
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
            }
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

