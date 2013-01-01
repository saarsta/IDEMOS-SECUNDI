

module.exports = function(router)
{
    router.all(/\/([0-9a-f]+)\/?$/,require('./results'));
    router.all('', require('./main'));
    router.get('/results',require('./results'));
    router.get('/list',require('./list'));
    router.get('/image',require('./image'));
};