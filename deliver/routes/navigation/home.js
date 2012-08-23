module.exports = function(req, res){

    if(req.isAuthenticated() && req.session.user.has_voted)
    {
        res.render('index.ejs', {
        });
    }else{
        res.render('index_not_logged.ejs', {
        });
    }
};