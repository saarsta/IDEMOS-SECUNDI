
module.exports = function(router) {
    router.get('/',require('./home'));

    router.get('/about',require('./about'));

    router.get('/team',require('./team'));

    router.get('/qa',require('./qa'));

    router.get('/founders',require('./founders'));

    router.get('/page/:link',require('./page'));
};

