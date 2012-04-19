/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 13/03/12
 * Time: 15:36
 * To change this template use File | Settings | File Templates.
 */



/*exports.index = function(req, res){
    res.render('index.ejs', { title: 'Express' })
};*/

exports.meidaInit = function(req, res){
    res.render('infoAndMeasures.ejs',{logged: req.isAuthenticated(), title:'מידע ומדדים', big_impressive_title:"כותרת גדולה ומרשימה",
        user: req.session.user,
        avatar:req.session.avatar_url,
        tag_name: req.query.tag_name,
        body_class:'layout',
        extra_head:'<script src="/javascripts/infoAndMeasures.js"></script>'});
};

exports.subjectPageInit = function(req, res){
    res.render('selectedSubjectPage.ejs',{title:'מידע ומדדים', logged: req.isAuthenticated(),
        big_impressive_title:"",
        subject_id: req.query.subject_id,
        subject_name: req.query.subject_name,
        tag_name: req.query.tag_name,
        user: req.session.user,
        avatar:req.session.avatar_url,
        body_class:'layout1',
        extra_head:'<script src="/javascripts/selectedSubjectPage.js"></script>'});
};

exports.selectedItemInit = function(req, res){
    res.render('selectedItem.ejs',{title:'מידע ומדדים', logged: req.isAuthenticated(),
        big_impressive_title:"",
        subject_id: req.query.subject_id,
//        subject_name: req.query.subject_name,
//        tag_name: req.query.tag_name,
        info_id: req.query.info_id,
        user: req.session.user,
        avatar:req.session.avatar_url,
        body_class:'layout1',
        extra_head:'<script src="/javascripts/selectedItem.js"></script>'});
};

exports.createDiscussionPageInit = function(req, res){
    res.render('createDiscussion.ejs',{title:"יצירת דיון", logged: req.isAuthenticated(),
        big_impressive_title: "",
        subject_id: req.query.subject_id,
        subject_name: req.query.subject_name,
        user: req.session.user,
        avatar:req.session.avatar_url,
        body_class:'layout',
        extra_head:'<script src="/javascripts/createDiscussion.js"></script>'});
};

exports.discussionPageInit = function(req, res){

    res.render('discussionPage.ejs',{title:"דיון",
        logged: req.isAuthenticated(),
        discussion_id: req.query.discussion_id,
        subject_id: req.query.subject_id,
        big_impressive_title: req.query.subject_name,
        user: req.session.user,
        avatar:req.session.avatar_url,
        body_class:'layout',
        extra_head:'<script src="/javascripts/discussionPage.js"></script>'});
};

exports.discussionPreviewPageInit = function(req, res){

    res.render('discussionPreviewPage.ejs',{title:'discussionPreviewPageInit.ejs', discussion_id: req.query.discussion_id, subject_id: req.query.subject_id,
        body_class:'layout',
        subject_name: req.query.subject_name});

};

exports.cyclePageInit = function(req, res){
    res.render('cyclePage.ejs',{title:'cyclePage.ejs', cycle_id: req.query.cycle_id, discussion_id: req.query.discussion_id, subject_name: req.query.subject_name});
};

exports.allDiscussions = function(req,res)
{
    res.render('target_ejs.ejs',{
        title:'מידע ומדדים',
        body_class:'layout',
        big_impressive_title:"כותרת גדולה ומרשימה",
        extra_head:'<script src="/javascripts/infoAndMeasures.js"></script>'
    });
};
<<<<<<< HEAD

exports.myUru = function(req,res)
{
    res.render('my_uru.ejs',{
        title:'הדף שלי',
        user: req.session.user,
        logged:true,
        avatar:req.session.avatar_url,
        body_class:'layout',
        big_impressive_title:"כותרת גדולה ומרשימה",
        extra_head:'',
        tag_name: req.query.tag_name,
        extra_head:'<script src="/javascripts/myUru.js"></script>'
    });

};
=======
>>>>>>> d0633acab43ff53e3d4e2124af26ec3c94618b60
