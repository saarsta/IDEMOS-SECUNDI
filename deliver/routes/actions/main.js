
var models = require('../../../models');

module.exports = function(req, res){

    models.Action.findById(req.params[0],function(err,action) {
        if(err)
            res.render('500.ejs',{error:err});
        else {
            if(!action)
                res.render('404.ejs');
            else {
                res.render('action.ejs',{
                    action:action,
                    tab:'actions'
                });
            }
        }
    });

};
