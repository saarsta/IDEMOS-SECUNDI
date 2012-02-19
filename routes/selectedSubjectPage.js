/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 19/02/12
 * Time: 13:59
 * To change this template use File | Settings | File Templates.
 */

exports.subjectPageInit = function(req, res){
    res.render('infoAndMeasures',{title:'infoAndMeasures.ejs', subject_name: ''});
}
