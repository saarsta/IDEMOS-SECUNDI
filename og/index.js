/**
 * Created with JetBrains WebStorm.
 * User: Roi Ronn
 * Date: 30/06/12
 * Time: 15:21
 * To change this template use File | Settings | File Templates.
 */
module.exports = function(router)
{
    router.get('/',require('./action.js'));

    router.get('/cb',require('./action_cb.js'));
};