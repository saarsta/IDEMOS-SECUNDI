
module.exports = function(router)
{
    router.all('',require('./list'));

    router.all(/\/subject\/([0-9a-f]+)\/?$/,require('./subject'));

    router.all(/\/([0-9a-f]+)\/?$/,require('./main'));

};