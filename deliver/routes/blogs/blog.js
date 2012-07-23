var models = require('../../../models');

module.exports = function (req, res) {

    models.Article.find({user_id: req.params[0]})
        .exec(function(err,articles) {
            if(err) {
                throw err;
            }
            else
                res.render('blog.ejs', {
                    title:"בלוגים",
                    isBlog:true,
                    articles:articles,
                    tab:'articles'
                });
        });
};