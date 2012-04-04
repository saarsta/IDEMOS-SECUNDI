exports.index = function(req, res){
//    console.log(req.session.user.username);
        res.render('index.ejs', { layout: false, logged: req.isAuthenticated(), user: req.session.user})
};
