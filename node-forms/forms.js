var util = require('util')
    //,Models = require('./models')
    ,fields = require('./fields')
    ,common = require('./common'),
    mongoose = require('mongoose');

var async = require('async');

var Models = {};

exports.set_models = function(models)
{
    Models = models;
}

var BaseForm = exports.BaseForm = function(request,options) {
    this.fields = {};
    options = options || {};
    this.data = options.data || request.data || {};
    this.files = options.files || request.files || {};
    this.request = request;
    this._fields_ready = false;
    this.fieldsets = null;
    this.errors = {};
    this.static = options.static || {};
    this.static['js'] = this.static['js'] || [];
    this.static['js'].push('/static/forms.js');
    this.static['js'].push('/js/jquery-ui-1.8.18.custom.min.js');
    this.static['js'].push('/js/jquery-ui-timepicker-addon.js');
    this.static['css'] = this.static['css'] || [];
    this.static['css'].push('/css/ui-lightness/jquery-ui-1.8.18.custom.css');
};

BaseForm.prototype.render_head = function(res)
{
    var self = this;
    return common.writer_to_string(function(res)
    {
        if(!self.static)
            return;
        if(self.static['js'])
            for(var i=0; i<self.static['js'].length; i++)
                res.write('<script src="' + self.static['js'][i] + '"></script>')
        if(self.static['css'])
            for(var i=0; i<self.static['css'].length; i++)
                res.write('<link type="text/css" href="' + self.static['css'][i] + '" rel="stylesheet">');
    },500);
};

BaseForm.prototype.get_fields = function()
{
    for(var attr in this)
    {
        if(this[attr] instanceof fields.BaseField)
        {
            this.fields[attr] = this[attr];
        }
    }
};

BaseForm.prototype.get_value = function(field_name)
{
    return this.data[field_name];
};

BaseForm.prototype.init_fields = function(req)
{
    this.get_fields();
    for(var field_name in this.fields)
    {
        var value = this.get_value(field_name);
        console.log(field_name);
        this.fields[field_name].set(value,this.request).name = field_name;
    }
    this._fields_ready = true;
};

BaseForm.prototype.save = function(callback)
{
    if(!this._fields_ready)
        this.init_fields();
    // not implemented
    if(!this.errors)
        this.is_valid();
    if(Object.keys(this.errors) > 0)
        callback({message:'form did not validate'});
    else
        this.actual_save(callback);
};

BaseForm.prototype.actual_save = function(callback)
{
    callback({message:'not implmeneted'});
};

BaseForm.prototype.is_valid = function(callback)
{
    var self = this;
    if(!self._fields_ready)
        self.init_fields();
    self.errors = {};
    self.clean_values = {};
    var clean_funcs = [];
    function create_clean_func(field_name)
    {
        return function(cbk)
        {
            self.fields[field_name].clean_value(self.request,function(err)
            {
                if(err)
                    callback(err);
                else
                {
                    if(self.fields[field_name].errors && self.fields[field_name].errors.length)
                        self.errors[field_name] = self.fields[field_name].errors;
                    else
                        self.clean_values[field_name] = self.fields[field_name].value;
                    cbk(null);
                }
            });
        };
    }
    for(var field_name in self.fields)
    {
        clean_funcs.push(create_clean_func(field_name));
    }
    async.parallel(clean_funcs,function(err,results)
    {
       if(err)
         callback(err);
       else
          callback(null,Object.keys(self.errors).length == 0);
    });
};

BaseForm.prototype.render_ready = function(callback)
{
    if(!this._fields_ready)
        this.init_fields();
    var funcs = [];
    var self = this;
    function render_func(field)
    {
        return function(cb)
        {
            field.pre_render(cb);
        };
    }
    for(var field_name in this.fields)
    {
        funcs.push(render_func(this.fields[field_name]));
    }
    async.parallel(funcs,function(err,results)
    {
        if(err)
            callback(err);
        else
            callback(null);
    });
};


BaseForm.prototype.render = function(res)
{
    var self = this;
    function render_fields(fields)
    {
//        console.log('rendering fields ' + fields);
        for(var i=0; i<fields.length; i++)
        {
            var field_name = fields[i];
            self.fields[field_name].render_label(res);
            self.render_error(res,field_name);
            self.fields[field_name].render(res);
            res.write('<br />');
        }
    };
    function render_fieldsets(fieldsets)
    {
  //      console.log('rendering fieldsets ' + fieldsets);
        for(var i=0; i<fieldsets.length; i++)
        {
            render_fieldset(fieldsets[i]);
        }
    }
    function render_fieldset(fieldset)
    {
    //    console.log('rendering fieldset ' + fieldset);
        var title = fieldset['title'] || '';
        res.write('<h2>' + title + '</h2>');
        var fields = fieldset.fields;
        if(fields)
            render_fields(fields);
        var fieldsets = fieldset.fieldsets;
        if(fieldsets)
            render_fieldsets(fieldsets);
    };
    if(self.fieldsets)
    {
        render_fieldsets(self.fieldsets);
    }
    else
        render_fields(Object.keys(self.fields));
    res.write('<input type="hidden" id="document_id" name="_id" value="' + (self.instance.isNew ? '' : self.instance.id) + '" />');
};

BaseForm.prototype.render_str = function()
{
    var self = this;
    return common.writer_to_string(function(res)
    {
        self.render(res);
    },16000);
};

BaseForm.prototype.render_error = function(res,field_name)
{
    if(this.errors[field_name])
        res.write(this.errors[field_name] + '<br />');
};


var MongooseForm = exports.MongooseForm = function(request,options,model) {
    options = options || {};
    MongooseForm.super_.call(this,request,options);
    this.model = model;
    this.instance = options.instance || new this.model();
};

util.inherits(MongooseForm,BaseForm);

MongooseForm.prototype.get_fields = function()
{
    this.fields = {};
    this.fieldsets = [];
    mongoose_fields_to_fieldsets(this.model.schema.paths,this.model.schema.tree,this.fields,this.fieldsets);
    MongooseForm.super_.prototype.get_fields.call(this);
};

function mongoose_fields_to_fieldsets(field_paths,field_tree,ref_fields,ref_fieldsets)
{
    ref_fieldsets.push({title:'',fieldsets:[]});
    for(var field in field_paths)
    {
        if(field == 'id' || field == '_id')
            continue;
        var parts = field.split('.');
        var form_field = mongoose_field_to_form_field(field_paths[field],parts[parts.length-1],field_tree);
        if(form_field)
            ref_fields[field] = form_field;
        var parent_fieldset = ref_fieldsets[0];
        for(var i=0; i<parts.length-1; i++)
        {
            var fieldset = null;
            for(j=0; j<parent_fieldset.fieldsets.length; j++)
            {
                if(parent_fieldset.fieldsets[j].title == parts[i])
                {
                    fieldset = parent_fieldset.fieldsets[j];
                }
            }
            if(!fieldset)
            {
                fieldset = {title:parts[i],fieldsets:[]};
                //parent_fieldset.fieldsets = parent_fieldset.fieldsets || [];
                parent_fieldset.fieldsets.push(fieldset);
            }
            parent_fieldset = fieldset;
        }
        parent_fieldset.fields = parent_fieldset.fields || [];
        parent_fieldset.fields.push(field);
    }
}

function mongoose_field_to_form_field(mongoose_field,name,tree)
{
    if(mongoose_field.options.auto)
        return new fields.ReadonlyField({});
    var is_required = mongoose_field.options.required ? true : false;
    var def = mongoose_field.options['default'] || null;
    var validators = [];
    if(mongoose_field.options.validate)
    {
        validators.push(function(value)
        {
            var result = mongoose_field.options.validate[0](value);
            return result ? true : mongoose_field.options.validate[1];
        });
    }
    if(mongoose_field.options.min)
        validators.push(function(value)
        {
            if(value >= mongoose_field.options.min)
                return true;
            else
                return 'value must be equal or greater than ' + mongoose_field.options.min;
        });
    if(mongoose_field.options.max)
        validators.push(function(value)
        {
            if(value <= mongoose_field.options.max)
                return true;
            else
                return 'value must be equal or lower than ' + mongoose_field.options.max;
        });
    var options = {required:is_required,'default':def,validators:validators,label:name};
    if(Array.isArray(mongoose_field.options.type))
    {
        console.log('create schema ' + name);
        var path_parts = mongoose_field.path.split('.');
        var inner_schema = tree;
        for(var j=0; j<path_parts.length; j++)
        {
            inner_schema = inner_schema[path_parts[j]];
        }
        if(Array.isArray(inner_schema))
            inner_schema = inner_schema[0];
        var schema;
        if(typeof(inner_schema) != 'object' || inner_schema.type)
        {
//            return new fields.StringField(options);
        //inner_schema = {stam_lo_bemet:inner_schema};
            var single_field = {};
            for(var attr in mongoose_field.options)
                single_field[attr] = mongoose_field.options[attr];
            single_field['type'] = mongoose_field.options.type[0];
            console.log(single_field);
            schema = new mongoose.Schema({__self__:single_field});
        }
        else
            schema = new mongoose.Schema(mongoose_field.options.type[0]);
        var list_fields = {};
        var list_fieldsets = [];
        mongoose_fields_to_fieldsets(schema.paths,schema.tree,list_fields,list_fieldsets);
        return new fields.ListField(options,list_fields,list_fieldsets);
    }
    if(mongoose_field.options.ref)
    {
        return new fields.RefField(options,Models[mongoose_field.options.ref]);
    }
    if(mongoose_field.options.enum)
    {
        return new fields.EnumField(options,mongoose_field.options.enum);
    }
    if(mongoose_field.options.type == Boolean)
        return new fields.BooleanField(options);
    if(mongoose_field.options.type == Number)
        return new fields.NumberField(options);
    if(mongoose_field.options.type == Date)
        return new fields.DateField(options);
    if(mongoose_field.instance && mongoose_field.instance == 'String')
        return new fields.StringField(options);
    return new fields.StringField(options);
};

MongooseForm.prototype.get_value = function(field_name)
{
    return this.data[field_name] || this.instance.get(field_name);
};

MongooseForm.prototype.actual_save = function(callback)
{
    var self = this;
    for(var field_name in self.clean_values)
        self.instance.set(field_name,self.clean_values[field_name]);
    self.instance.save(function(err,object)
    {

       if(err)
       {
           self.errors = err.errors;
           callback({message:'failed'});
       }
       else
       {
           callback(null,object);
       }
    });
};

