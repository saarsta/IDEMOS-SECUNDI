/**
 * Created by JetBrains WebStorm.
 * User: liorur
 * Date: 12/04/12
 * Time: 13:36
 * To change this template use File | Settings | File Templates.
 */

exports.actions = function(req, res){
    res.render('actionList.ejs',{logged: req.isAuthenticated(), title:'נושא הדיון', all_pending_actions:"רשימת כל הפעולות הממתינות לאישור",
        user: req.session.user,
        avatar:req.session.avatar_url,
        tag_name: req.query.tag_name,
        body_class:'layout',
        extra_head:'<script src="/resources/js/jquery.stylish-select.min.js"></script><script src="/resources/js/selectbox.js"></script><script src="/javascripts/actionList.js"></script>'});
};


exports.actionsTestData = function(req, res){
    var data= {"objects":[
                    {"_id":"4f4517346d35790100000008","image_field":{"url":"resources/images/assets/image3.jpg","size":777835},"title":"כותרת פעולה1","description":"הסבר קצר (תיאור, משאבים, נתונים)","date":"תאריך","participating_members":"מספר חברים משתתפים","required_participation":"כמות משתתפים רצויה","participants":"מספר משתתפים","waiting_period":"כמה זמן ממתין לאישור","proposed_date":"תאריך הצעה","popular_posts":["תגובה פופולרית מהדיון הנערך על הפעולה1","תגובה פופולרית מהדיון הנערך על הפעולה2"]},
                    {"_id":"4f4517346d35790100000008","image_field":{"url":"resources/images/assets/image3.jpg","size":777835},"title":"כותרת פעולה2","description":"הסבר קצר (תיאור, משאבים, נתונים)","date":"תאריך","participating_members":"מספר חברים משתתפים","required_participation":"כמות משתתפים רצויה","participants":"מספר משתתפים","waiting_period":"כמה זמן ממתין לאישור","proposed_date":"תאריך הצעה","popular_posts":["תגובה פופולרית מהדיון הנערך על הפעולה1","תגובה פופולרית מהדיון הנערך על הפעולה2"]},
                    {"_id":"4f4517346d35790100000008","image_field":{"url":"resources/images/assets/image3.jpg","size":777835},"title":"כותרת פעולה3","description":"הסבר קצר (תיאור, משאבים, נתונים)","date":"תאריך","participating_members":"מספר חברים משתתפים","required_participation":"כמות משתתפים רצויה","participants":"מספר משתתפים","waiting_period":"כמה זמן ממתין לאישור","proposed_date":"תאריך הצעה","popular_posts":["תגובה פופולרית מהדיון הנערך על הפעולה1","תגובה פופולרית מהדיון הנערך על הפעולה2"]}],
                "meta":{"total_count":3,"offset":0,"limit":20}};
    res.json(data);
};


/*exports.index = function(req, res){
 res.render('index.ejs', { title: 'Express' })
 };

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
    res.render('createDiscussion.ejs',{title:'discussionInit.ejs',  logged: req.isAuthenticated(),
        big_impressive_title: "",
        subject_id: req.query.subject_id,
        subject_name: req.query.subject_name,
        user: req.session.user,
        avatar:req.session.avatar_url,
        body_class:'layout',
        extra_head:'<script src="/javascripts/createDiscussion.js"></script>'});
}

exports.discussionPageInit = function(req, res){

    res.render('discussionPage.ejs',{title:'discussionPageInit.ejs', discussion_id: req.query.discussion_id, subject_id: req.query.subject_id,
        body_class:'layout',
        subject_name: req.query.subject_name});

}

exports.discussionPreviewPageInit = function(req, res){

    res.render('discussionPreviewPage.ejs',{title:'discussionPreviewPageInit.ejs', discussion_id: req.query.discussion_id, subject_id: req.query.subject_id,
        body_class:'layout',
        subject_name: req.query.subject_name});

}

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
}
*/