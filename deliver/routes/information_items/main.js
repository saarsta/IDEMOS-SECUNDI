
var models = require('../../../models')
    ,InformationItemResource = require('../../../api/InformationItemResource');

module.exports = function(req,res)
{
    var item_id = req.params[0];

    models.InformationItem.findById(item_id).populate('subject_id').run(function(err,item){
        if(err)
            res.render('500.ejs',{err:err});
        else
        {
            if(!item)
                res.redirect('/information_items');
            else
            {
                if(req.isAuthenticated())
                {
                    var resource = new InformationItemResource();
                    resource.add_user_likes(req.session.user._id,item,function(err,item){
                        console.log(item.user_like);
                        if(err)
                            res.render('500.ejs',{err:err});
                        else
                            render_information_item_page(req,res,item);
                    });
                }
                else
                    render_information_item_page(req,res,item);
            }
        }
    })

};

function render_information_item_page(req,res,item) {
    res.render('information_item.ejs',{
        url: req.url,
        item:item,
        tag_name:req.query.tag_name||'',
        layout: false,
        user_logged: req.isAuthenticated(),
        user: req.session.user,
        auth_user: req.session.auth.user,
        tab:'information_items',
        avatar_url: req.session.avatar_url
    });
}