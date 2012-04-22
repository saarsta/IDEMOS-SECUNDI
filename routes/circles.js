/**
 * Created by JetBrains WebStorm.
 * User: liorur
 * Date: 12/04/12
 * Time: 13:36
 * To change this template use File | Settings | File Templates.
 */

exports.pendingActions = function(req, res){
    res.render('pendingActionList.ejs',{logged: req.isAuthenticated(), title:'נושא הדיון', all_pending_actions:"רשימת כל הפעולות הממתינות לאישור",
        user: req.session.user,
        avatar:req.session.avatar_url,
        tag_name: req.query.tag_name,
        body_class:'layout',
        extra_head:'<script src="/resources/js/jquery.stylish-select.min.js"></script><script src="/resources/js/selectbox.js"></script><script src="/javascripts/pendingActionList.js"></script>'});
};

exports.actions = function(req, res){
    res.render('actionList.ejs',{logged: req.isAuthenticated(), title:'כותרת שקשורה לכל הפעולות', all_actions:"רשימת כל הפעולות במערכת", subjects_title:"בחירה מתוך 7 תחומי על ",
        user: req.session.user,
        avatar:req.session.avatar_url,
        tag_name: req.query.tag_name,
        body_class:'layout',
        extra_head:'<script src="/resources/js/jquery.stylish-select.min.js"></script><script src="/resources/js/selectbox.js"></script><script src="/javascripts/actionList.js"></script>'});
};

exports.discussions = function(req, res){
    res.render('discussionList.ejs',{logged: req.isAuthenticated(), title:'כותרת שקשורה לכל הדיונים',  all_discussions:"רשימת כל הדיונים במערכת", subjects_title:"בחירה מתוך 7 תחומי על ",
        user: req.session.user,
        avatar:req.session.avatar_url,
        tag_name: req.query.tag_name,
        body_class:'layout',
        extra_head:'<script src="/resources/js/jquery.stylish-select.min.js"></script><script src="/resources/js/selectbox.js"></script><script src="/javascripts/discussionList.js"></script>'});
};

exports.cycles = function(req, res){
    res.render('circleList.ejs',{logged: req.isAuthenticated(), title:'כותרת שקשורה לכל מעגלי התנופה', all_cycles:"רשימת כל מעגלי התנופה", subjects_title:"בחירה מתוך 7 תחומי על ",
        user: req.session.user,
        avatar:req.session.avatar_url,
        tag_name: req.query.tag_name,
        body_class:'layout',
        extra_head:'<script src="/resources/js/jquery.stylish-select.min.js"></script><script src="/resources/js/selectbox.js"></script><script src="/javascripts/cycleList.js"></script>'});
};


