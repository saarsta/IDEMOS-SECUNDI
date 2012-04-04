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
    res.render('infoAndMeasures.ejs',{title:'מידע ומדדים',big_impressive_title:"כותרת גדולה ומרשימה",
        extra_head:'<script src="/javascripts/infoAndMeasures.js"></script>'});
};

exports.subjectPageInit = function(req, res){

    res.render('selectedSubjectPage.ejs',{title:'selectedSubjectPage.ejs', subject_id: req.query.subject_id,
        subject_name: req.query.subject_name});

};

exports.createDiscussionPageInit = function(req, res){

    res.render('createDiscussion.ejs',{title:'discussionInit.ejs', subject_id: req.query.subject_id,
        subject_name: req.query.subject_name});

}

exports.discussionPageInit = function(req, res){

    res.render('discussionPage.ejs',{title:'discussionPageInit.ejs', discussion_id: req.query.discussion_id, subject_id: req.query.subject_id,
        subject_name: req.query.subject_name});

}

exports.discussionPreviewPageInit = function(req, res){

    res.render('discussionPreviewPage.ejs',{title:'discussionPreviewPageInit.ejs', discussion_id: req.query.discussion_id, subject_id: req.query.subject_id,
        subject_name: req.query.subject_name});

}

exports.cyclePageInit = function(req, res){
    res.render('cyclePage.ejs',{title:'cyclePage.ejs', cycle_id: req.query.cycle_id, discussion_id: req.query.discussion_id, subject_name: req.query.subject_name});
};

exports.allDiscussions = function(req,res)
{
    res.render('target_ejs.ejs',{
        title:'מידע ומדדים',
        big_impressive_title:"כותרת גדולה ומרשימה",
        extra_head:'<script src="/javascripts/infoAndMeasures.js"></script>'
    });
}
