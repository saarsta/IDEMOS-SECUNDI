var models = require('../../../models');

module.exports = function(req,res)
{
    res.render('actions_list.ejs')
        {
            layout: false,
//            tag_name:req.query.tag_name,
//            title:"פעולות",
//            logged: req.isAuthenticated(),
//            big_impressive_title: "",

//            url:req.url,
//            tab:'cycles'
            cycle_id: req.params[0]
        };
};