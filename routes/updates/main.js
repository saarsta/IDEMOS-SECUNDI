var models = require('../../models');

module.exports = function(req, res) {
    models.Update.findById(req.params[0]).populate('cycle', {'_id': 1, 'title': 1}).exec(function(err, update) {
        if(err || !update) {
            res.render('500.ejs',{error:err});
            return;
        }
        res.render('update.ejs',{
            update: update,
            meta:{
                type:'updates',
                title:update.title,
                description:update.text_field,
                image: (update.image_field_preview && item.image_field.url),
                link:'/updates/' + update.id,
                id:update.id
            }
        });
    });
};
