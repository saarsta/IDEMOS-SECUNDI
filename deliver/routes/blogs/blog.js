var models = require('../../../models');

module.exports = function (req, res) {

    console.log(req.params[0]);
    models.Article.find({user_id: req.params[0]})
        .exec(function(err,articles) {
            if(err) {
                throw err;
            }
            else{
                models.BlogTag.find({user_id: req.params[0]}, ['tag'])
                    .sort('popularity','descending')
                    .run(function(err, tags){
                        if (err)
                            throw err;
                        else{
                            res.render('blog.ejs', {
                                title:"בלוגים",
                                isBlog:true,
                                articles:articles,
                                tab:'articles',
                                user: req.session.user,
                                user_logged: req.isAuthenticated(),
                                tags: tags
                            });
                        }
                    })
            }
        });
    };