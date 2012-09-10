

module.exports = function(router)
{
    router.get('/create/:cycle_id', require('./create').get);

    router.all(/\/cycle\/([0-9a-f]+)\/?/,require('./cycle'));

    router.all(/\/subject\/([0-9a-f]+)\/?/, require('./subject'));

    router.all(/\/([0-9a-f]+)\/?$/, require('./main'));

    router.all('', require('./list'));

};