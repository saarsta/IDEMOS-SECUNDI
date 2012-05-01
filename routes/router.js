
var Class = require('sji');

var Router = module.exports = Class.extend({
   init:function(app,path){
       this.app = app;
       this.base_path = path || '';
       var methods = ['get','post','all','put','delete'];
       var self = this;
       methods.forEach(function(method)
       {
           self[method] = function(path)
           {
               this.register_func(this.app[method],arguments)
           };
       });
   },
   register_func : function(func,args)
   {
       var path = args[0];
       args[0] = this.build_path(path);
       func.apply(this.app,args);
   },
   build_path:function(path)
   {
        return this.base_path + path;
   },
   include:function(path,routing_module)
    {
        var my_router = new Router(this.app,this.build_path(path));
        routing_module(my_router);
        return my_router;
    }
});

Router.base = function(app)
{
    var router = new Router(app);
    return router;
};
