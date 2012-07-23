/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 08/07/12
 * Time: 14:33
 * To change this template use File | Settings | File Templates.
 */

module.exports = function(req, res){
    res.render('cyclePage.ejs',{

        logged: req.isAuthenticated(),
        user: req.session.user,
        avatar:req.session.avatar_url,
        cycle_id: req.params.id,
        tab:'cycles',
        discussion_id: req.query.discussion_id, subject_name: req.query.subject_name});
};
