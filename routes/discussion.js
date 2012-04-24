
exports.createDiscussionPageInit = function(req, res){
    res.render('createDiscussion.ejs',{title:"יצירת דיון", logged: req.isAuthenticated(),
        big_impressive_title: "",
        subject_id: req.query.subject_id,
        subject_name: req.query.subject_name,
        user: req.session.user,
        avatar:req.session.avatar_url,
        tab:'discussions',
        extra_head:'<script src="/javascripts/createDiscussion.js"></script>'});
};

exports.discussionPageInit = function(req, res){

    res.render('discussionPage.ejs',{title:"דיון",
        logged: req.isAuthenticated(),
        discussion_id: req.params.id,
        subject_id: req.query.subject_id,
        big_impressive_title: req.query.subject_name,
        user: req.session.user,
        avatar:req.session.avatar_url,
        tab:'discussions',
        extra_head:'<script src="/javascripts/discussionPage.js"></script>'});
};

exports.discussionPreviewPageInit = function(req, res){

    res.render('discussionPreviewPage.ejs',{title:'discussionPreviewPageInit.ejs',
        discussion_id: req.params.id,
        subject_id: req.query.subject_id,
        tab:'discussions',
        subject_name: req.query.subject_name});

};
