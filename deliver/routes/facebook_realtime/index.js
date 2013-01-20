module.exports = function(router)
{
    router.get('', require('./verification'));
    router.post('', require('./change'));
};