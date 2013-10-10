

module.exports = function(router)
{
    router.all(/\/discussion\/([0-9a-f]+)\/?/,require('./selected_item'));

    router.all(/\/cycle\/([0-9a-f]+)\/?/,require('./selected_item'));

    router.all('',require('./main'));
};