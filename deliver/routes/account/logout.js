

module.exports = function (req, res) {
    res.clearCookie('connect.sid', {path:'/'});
    delete req.session['user_id'];
    delete req.session['user'];
    req.session.save();

    req.session.destroy();
    req.logout();
};