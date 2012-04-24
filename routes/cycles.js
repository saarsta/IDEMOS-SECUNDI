exports.cyclePageInit = function(req, res){
    res.render('cyclePage.ejs',{

        logged: req.isAuthenticated(),
        extra_head:'<script src="/javascripts/cyclePage.js"></script>',
        user: req.session.user,
        avatar:req.session.avatar_url,
        cycle_id: req.params.id,
        tab:'cycles',
        discussion_id: req.query.discussion_id, subject_name: req.query.subject_name});
};

exports.action = function(req,res)
{
    res.send('not yet');
};

exports.newAction = function(req,res)
{
    res.send('not yet');
};