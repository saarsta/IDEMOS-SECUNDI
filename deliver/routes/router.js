
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
   is_regex:function(path)
   {
       return typeof(path) == 'object' && typeof(path.source) != 'undefined';
   },
   get_regex_source:function(path)
   {
        return this.is_regex(path) ? path.source : path;
   },
   build_path:function(path)
   {
        if(this.is_regex(path) || this.is_regex(this.base_path))
            return RegExp(this.get_regex_source(this.base_path) + this.get_regex_source(path));
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
    return new Router(app);
};
