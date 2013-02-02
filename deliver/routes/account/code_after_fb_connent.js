var common = require('./common');

module.exports = {
    get: function (req, res) {
        res.redirect(common.DEFAULT_LOGIN_REDIRECT);
    },

    post: function (req, res) {
        res.redirect(common.DEFAULT_LOGIN_REDIRECT);
    }
};

