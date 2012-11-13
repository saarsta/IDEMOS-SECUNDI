module.exports = function(req, res){
    res.render('order_shirts.ejs', {
        layout: false,
        url: req.url,
        user_logged: req.isAuthenticated()
    });
};