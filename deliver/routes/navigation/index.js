
module.exports = function(router) {
    router.get('/',require('./home'));

    router.get('/about',require('./about'));

    router.get('/team',require('./team'));

    router.get('/founders',require('./founders'));

    router.get('/page/:link',require('./page'));
};

