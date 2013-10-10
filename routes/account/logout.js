module.exports = function (req, res) {
    delete req.session;
    req.logout();
};
