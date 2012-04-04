/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 03/04/12
 * Time: 17:58
 * To change this template use File | Settings | File Templates.
 */
exports.mm_search = function(req, res){
//    console.log(req.session.user.username);
    res.render('mmSearch.ejs', { layout: false, logged: req.isAuthenticated(), user: req.session.user, tag_name: req.tag_name})
};