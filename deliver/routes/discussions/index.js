
module.exports = function(router)
{
    router.all(/\/new\/([0-9a-f]+)\/?/,require('./new'));

    router.all(/\/([0-9a-f]+)\/?$/,require('./main'));

    router.all('', require('./list'));
};