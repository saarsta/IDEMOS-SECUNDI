
module.exports = function(router)
{
    router.all(/\/new\/([0-9a-f]+)\/?/,require('./new'));

    router.all(/\/subject\/([0-9a-f]+)\/?/,require('./subject'));

    router.all(/\/([0-9a-f]+)\/?$/,require('./main'));

    router.all(/\/([0-9a-f]+)\/posts\/([0-9a-f]+)\/?$/,require('./post'));

    router.all('', require('./list'));

};