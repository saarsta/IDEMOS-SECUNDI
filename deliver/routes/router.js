
var Class = require('sji');

var Router = module.exports = Class.extend({
   init:function(app,path){
       this.app = app;
       this.base_path = path || '';
       var methods = ['get','post','put','delete'];
       var self = this;
       methods.forEach(function(method)
       {
           self[method] = function(path)
           {
               this.register_func(this.app[method],arguments)
           };
       });
   },
   all:function() {
       if(typeof(arguments[arguments.length-1]) == 'object') {
           var funcObject = arguments[arguments.length-1];
           arguments[arguments.length-1] = function(req,res) {
               var method = req.method.toLowerCase();
               if( method in funcObject)
                   funcObject[method](req,res);
               else
                   res.send('method not supported',400);
           };
           this.register_func(this.app.all,arguments);
       }
       else
           this.register_func(this.app.all,arguments);
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
   concat_regex:function(reg1,reg2){
       var str1 = this.get_regex_source(reg1);
       var str2 = this.get_regex_source(reg2);
       if(str1[0] != '^')
          str1 = '^' + str1;
       return RegExp(str1 + str2);
   },
   build_path:function(path)
   {
        if(this.is_regex(path) || this.is_regex(this.base_path))
            return this.concat_regex(this.base_path,path);
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
