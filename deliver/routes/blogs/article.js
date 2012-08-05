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
                    article.text = (article.text).replace(/(<([^>]+?)>)/ig,"");
                    models.BlogTag.find({user_id: article.user_id}, ['tag'])
                        .sort('popularity','descending')
                        .exec(function(err, tags){
                            if (err)
                                throw err;
                            else{
                                res.render('blog.ejs', {
                                    title: "בלוגים",
                                    isBlog: false,
                                    articles: [article],
                                    tab: 'articles',
                                    blogger: article.user_id,
                                    user: req.session.user,
                                    user_logged: req.isAuthenticated(),
                                    tags: tags
                                });
                            }
                        })
//
//                        res.render('blog.ejs', {
//                            title:"בלוגים",
//                            isBlog:false,
//                            articles:[article],
//                            tab:'articles',
//                            blogger: article.user_id,
//                            user: req.session.user,
//                            user_logged: req.isAuthenticated(),
//                            tags: article.tags
//                        });
                }

            }
        });
};

