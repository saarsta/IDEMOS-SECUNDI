
module.exports = function(router)
{
    router.all(/\/subject\/([0-9a-f]+)\/?/,require('./subject'));

    router.all(/\/([0-9a-f]+)\/?$/,require('./main'));

    router.all('', require('./list'));
};