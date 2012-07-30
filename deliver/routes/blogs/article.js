var models = require('../../../models');

module.exports = function(req,res) {
    console.log(req.params[0]);
    models.Article.findById(req.params[0])
        .populate("user_id")
        .exec(function(err,article) {
            if(err) {
                res.render('500.ejs',{});
            }
            else {
                if(!article)
                    res.render('404.ejs',{});
                else{

                        res.render('blog.ejs', {
                            title:"בלוגים",
                            isBlog:false,
                            articles:[article],
                            tab:'articles',
                            blogger: article.user_id,
                            user: req.session.user,
                            user_logged: req.isAuthenticated(),
                            tags: article.tags
                        });
                }

            }
        });
};