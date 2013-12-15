var crypto = require('crypto');

exports.DEFAULT_LOGIN_REDIRECT = 'discussions';

exports.LOGIN_PATH = '/account/login';

exports.DONT_NEED_LOGIN_PAGES = [
    /^\/images/,
    /^\/static/,
    /^\/css/,
    /stylesheets\/style.css/,
    /favicon.ico/,
    /facebookconnect.html/,
    /account\/login/,
    /^\/account\/logout/,
    /account\/register/,
    /account\/afterSuccessFbConnect/,
    /account\/facebooklogin/,
    /api\/subjects/,
    /^\/api\//,
];//regex

exports.REDIRECT_FOR_LOGIN_PAGES = [/^\/myuru$/, /^\/mail_settings/];


var hash_password = exports.hash_password = function (password) {
    return crypto.createHmac('sha1', 'ninjastyle').update(password).digest('hex');
};

var check_password = exports.check_password = function (hashed, raw) {
    return hashed == hash_password(raw);
};



