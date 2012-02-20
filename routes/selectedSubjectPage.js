/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 19/02/12
 * Time: 13:59
 * To change this template use File | Settings | File Templates.
 */


exports.subjectPageInit = function(req, res){

   res.render('selectedSubjectPage.ejs',{title:'selectedSubjectPage.ejs', subject_id: req.query.subject_id,
        subject_name: req.query.subject_name});

}
