var crypto = require('crypto');

exports.DEFAULT_LOGIN_REDIRECT = '';

exports.LOGIN_PATH = '/account/login';

exports.DONT_NEED_LOGIN_PAGES = [/^\/images/,/^\/static/, /^\/css/, /stylesheets\/style.css/, /favicon.ico/, /account\/login/, /^\/account\/logout/, /account\/register/,
    /facebookconnect.html/, /account\/afterSuccessFbConnect/, /account\/facebooklogin/,
    /api\/subjects/, /^\/admin/, /^\/api\//, ];//regex

exports.REDIRECT_FOR_LOGIN_PAGES = [/^\/discussions\/new/];

var hash_password = exports.hash_password = function(password)
{

    return crypto.createHmac('sha1', 'ninjastyle').update(password).digest('hex');
};

var check_password = exports.check_password = function(hashed,raw)
{
    return hashed == hash_password(raw);
};



