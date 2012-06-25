
module.exports = function(req,res)
{
    if(/uru\.org\.il/.test(req.app.settings.root_path)) {
        var link = req.app.settings.root_path + (req.query.link || '');
        res.redirect("http://www.facebook.com/sharer/sharer.php?u=" + link + "&referrer=" + req.session.user_id);
    }
    else
        res.send('soon will be enabled');
};