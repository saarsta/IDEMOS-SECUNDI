

module.exports = function(router) {

    router.all(/\/article\/([0-9a-f]+)\/?/,require('./article'));

    router.all(/\/([0-9a-f]+)\/?$/,require('./blog'));

};