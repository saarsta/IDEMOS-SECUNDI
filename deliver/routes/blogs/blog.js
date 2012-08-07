var models = require('../../../models');
    _ = require('underscore');
module.exports = function (req, res) {

    console.log(req.params[0]);
    models.Article.find({user_id: req.params[0]})
        .populate('user_id')
        .exec(function(err,articles) {
            if(err) {
                throw err;
            }
            else{

//                _.each(articles, function(article){
//                    console.log(article.text)/* = (article.text).replace(/(<([^>]+?)>)/ig,"")*/;
//                })

                models.BlogTag.find({user_id: req.params[0]}, ['tag'])
                    .sort('popularity','descending')
                    .exec(function(err, tags){
                        if (err)
                            throw err;
                        else{
                            res.render('blog.ejs', {
                                title:"בלוגים",
                                isBlog:true,
                                articles:articles,
                                tab:'articles',
                                blogger: articles[0].user_id,
                                user: req.session.user,
                                user_logged: req.isAuthenticated(),
                                tags: tags
                            });
                        }
                    })
            }
        });
    };