exports.cyclePageInit = function(req, res){
    res.render('cyclePage.ejs',{

        logged: req.isAuthenticated(),
        extra_head:'<script src="/javascripts/cyclePage.js"></script>' +
                    '<script src="/js/jquery.colorbox-min.js"></script>' +
                      '<script src="/js/jquery-ui-timepicker-addon.js"></script>' +
                  '<link rel="stylesheet" type="text/css" media="screen" href="../resources/css/colorbox.css" />' +
                    '<link rel="stylesheet" type="text/css" media="screen" href="../node-forms/css/ui-lightness/jquery-ui-1.8.18.custom.css" />',
        user: req.session.user,
        avatar:req.session.avatar_url,
        cycle_id: req.params.id,
        tab:'cycles',
        discussion_id: req.query.discussion_id, subject_name: req.query.subject_name});
};

exports.action = function(req,res)
{
    res.render('action.ejs',{
            action_id : req.params.id,
            title:"פעולה",
            user: req.session.user,
            logged:true,
            avatar:req.session.avatar_url,

            big_impressive_title:"כותרת גדולה ומרשימה"

        }
    );
};

exports.newAction = function(req,res)
{
    res.render('newAction.ejs',{});
};