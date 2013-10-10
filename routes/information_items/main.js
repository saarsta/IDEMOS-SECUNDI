
var models = require('../../models')
    ,async = require('async')
    ,InformationItemResource = require('../../api/InformationItemResource');


module.exports = function(req,res)
{
    var item_id = req.params[0];

    async.parallel([

        function(cbk){
            models.InformationItem.findById(item_id).populate('subject_id')
                .exec(function(err,item){
                    if(err)
                        res.render('500.ejs',{err:err});
                    else
                    {
                        if(!item)
                            res.render('404.ejs');
                        else
                        {
                            if(req.isAuthenticated())
                            {
                                var resource = new InformationItemResource();
                                resource.add_user_likes(req.user.id, item, function(err,item) {
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
        },

        function(cbk){
            models.InformationItem.update({_id: item_id}, {$inc: {view_counter: 1}}, cbk);
        }
    ])
};

function render_information_item_page(req,res,item) {
    res.render('information_item.ejs',{
        url: req.url,
        item:item,
        tag_name:req.query.tag_name||'',
        layout: false,
        user_logged: req.isAuthenticated(),
        user: req.user,
        auth_user: req.session.auth.user,
        tab:'information_items',
        avatar_url: req.session.avatar_url,
        meta:{
            type:'information_items',
            title:item.title,
            description:item.text_field_preview || item.text_field,
            image: (item.image_field_preview && item.image_field_preview.url) || (item.image_field && item.image_field.url),
            link:'/information_items/' + item.id,
            id:item.id
        },
        description: item.text_field_preview
    });
}
