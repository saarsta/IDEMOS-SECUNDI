var widgets = require('./widgets'),
    async = require('async'),
    common = require('./common');
var _extends = common._extends;

var BaseField = exports.BaseField = function(options) {
    options = options || {};
    this['default'] = options['default'];
    this.required = options.required || false;
    this.validators = options.validators || [];
    var widget_options = options.widget_options || {};
    widget_options.attrs = options.attrs || {};
    widget_options.required = this.required;
    this.widget = new options.widget(widget_options);
    this.value = null;
    this.errors = [];
    this.name = '';
    this.label = options.label;
};


BaseField.prototype.render_label = function(res)
{
    res.write('<label for="id_' + this.name + '">' + (this.label || this.name) + '</label>');
};

BaseField.prototype.render_label_str = function()
{
    return common.writer_to_string(this.render_label,80);
};

BaseField.prototype.render = function(res)
{
    this.widget.name = this.name;
    this.widget.value = this.value;
    this.widget.render(res);
    return this;
};

BaseField.prototype.render_str = function()
{
    return common.writer_to_string(this.render,1024);
};

BaseField.prototype.set = function(value,req)
{
    this.value = value || this['default'];
    return this;
};

BaseField.prototype.clean_value = function(req,callback)
{
    if((this.value == null || this.value == []) && this.required)
        this.errors.push('this field is required');
    for(var i=0; i<this.validators; i++)
    {
        var result = this.validators[i](this.value);
        if(result != true )
        {
            this.errors.push(result);
        }
    }
    callback(null);
    return this;
};

BaseField.prototype.pre_render = function(callback) {
    this.widget.pre_render(callback);
};

var StringField = exports.StringField = _extends(BaseField,function(options)
{
    options = options || {};
    options.widget = options.widget || widgets.TextWidget;
    StringField.super_.call(this,options);
});

var ReadonlyField = exports.ReadonlyField = _extends(BaseField,function(options)
{
    options = options || {};
    options.widget = options.widget || widgets.HiddenWidget;
    ReadonlyField.super_.call(this,options);
});

ReadonlyField.prototype.render_label = function(res)
{

};

var BooleanField = exports.BooleanField = _extends(BaseField, function(options) {
    options = options || {};
    options.widget = options.widget || widgets.CheckboxWidget;
    BooleanField.super_.call(this,options);
});

BooleanField.prototype.clean_value = function(req,callback)
{
    if(this.value && this.value != '')
        this.value = true;
    else
        this.value = false;
    BooleanField.super_.prototype.clean_value.call(this,req,callback);
    return this;
}

var EnumField = exports.EnumField = _extends(BaseField,function(options,choices)
{
    options = options || {};
    options.widget = options.widget || widgets.ChoicesWidget;
    options.widget_options = options.widget_options || {};
    options.widget_options.choices = options.widget_options.choices || choices;
//    options.required = true;
    EnumField.super_.call(this,options);
});

EnumField.prototype.clean_value = function(req,callback)
{
    var found = false;
    for(var i=0; i<this.choices.length; i++)
    {
        if(this.choices[i] == this.value)
            found = true;
    }
    if(this.value === null || this.value == '')
    {
        this.value = null;
        found = true;
    }
    if(!found)
        this.errors = ['possible values are: ' + this.choices];
        this.value = null || this['default'];
    EnumField.super_.prototype.clean_value.call(this,req,callback);
    return this;
};


var RefField = exports.RefField = _extends(EnumField,function(options,ref)
{
    this.ref = ref;
    if(!this.ref)
        throw new TypeError('Model was not provided');
    options = options || {};
    options.widget = options.widget || widgets.RefWidget;
    options.widget_options = options.widget_options || {};
    options.widget_options.ref = options.widget_options.ref || ref;
    RefField.super_.call(this,options,[]);
//    this.required = options ? options.required : false;
});

var NumberField = exports.NumberField = _extends(StringField,function(options)
{
    options = options || {};
    options.widget = options.widget || widgets.NumberWidget;
    NumberField.super_.call(this,options);
});

NumberField.prototype.clean_value = function(req,callback)
{
    if(this.value === null && this.value == '' && !this.required)
        this.value = null;
    else
    {
        try
        {
            this.value = Number(this.value);
        }
        catch(e)
        {
            this.errors.push('value ' + this.value + ' is not a number');
            this.value = null;
        }
    }
    NumberField.super_.prototype.clean_value.call(this,req,callback);
    return this;
};

var DateField = exports.DateField = _extends(BaseField,function(options)
{
    options = options || {};
    options.widget = options.widget || widgets.DateWidget;
    DateField.super_.call(this,options);
});

var ListField = exports.ListField = _extends(BaseField,function(options,fields,fieldsets)
{
    options = options || {};
    options['default'] = options['default'] || [];
    options.widget = options.widget || widgets.ListWidget;
    ListField.super_.call(this,options);
    this.fields = fields;
    this.fieldsets = fieldsets;
});

ListField.prototype.clean_value = function(req,callback)
{
    var self = this;
    var prefix = self.name + '_li';
    var values = {};
    var clean_funcs = [];
    function create_clean_func(num,name)
    {
        return function(cbk)
        {
            var data = values[num] || {};
            values[num] = data;
            var field = self.fields[name];
            field.name = name;
            field.set(req.body[field_name],req);
            field.clean_value(req,function(err)
            {
                if(field.errors && field.errors.length)
                    this.errors = Array.concat(self.errors,field.errors);
                else
                {
                    data[name] = field.value;
                    if(name == '__self__')
                        values[num] = field.value;
                }
                cbk(null);
            });
        }
    }
    for(var field_name in req.body)
    {
        if(field_name.indexOf(prefix, 0) > -1 )
        {
            var suffix = field_name.split(prefix)[1];
            var next_ = suffix.indexOf('_');
            var num = suffix.substring(0,next_);
            var name = suffix.substring(next_+1);
            clean_funcs.push(create_clean_func(num,name));
        }
    }
    async.parallel(clean_funcs,function(err)
    {
        self.value = [];
        for(var key in values)
            self.value.push(values[key]);
        callback(null);
    });
    return self;
};

ListField.prototype.pre_render = function(callback)
{
    var funcs = [];
    var self = this;
    console.log('pre rending list');

    function pre_render_partial(field)
    {
        return function(cbk) {
            console.log('pre render' + field);
            self.fields[field].pre_render(function(err,results)
            {
                console.log('finished with ' + field);
                cbk(err,results);
            });
        };
    }

    for(var field in self.fields)
    {
        funcs.push(pre_render_partial(field));
    }
    funcs.push(self.widget.pre_render);
    async.parallel(funcs,function(err,results)
    {
        console.log('done');
       callback(err);
    });
    return self;
};

function render_list_item(res,fields,fieldsets,prefix,value)
{
    value = value || {};
    function render_fields(field_names)
    {
//        console.log('rendering fields ' + fields);
        for(var i=0; i<field_names.length; i++)
        {
            var field_name = field_names[i];
            fields[field_name].name = prefix + field_name;
            if(field_name != '__self__')
            {
                fields[field_name].value = value[field_name];
                fields[field_name].render_label(res);
            }
            else
                fields[field_name].value = value;
            fields[field_name].render(res);
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
        if(title != '')
            res.write('<h2>' + title + '</h2>');
        var field_names = fieldset.fields;
        if(field_names)
            render_fields(field_names);
        var fieldsets = fieldset.fieldsets;
        if(fieldsets)
            render_fieldsets(fieldsets);
    };
    if(fieldsets)
    {
        render_fieldsets(fieldsets);
    }
    else
        render_fields(Object.keys(fields));
}

ListField.prototype.render = function(res)
{
    var self = this;
    function render_template(res)
    {
        //console.log(self.fields);
        var prefix = self.name + '_tmpl_';
        render_list_item(res,self.fields,self.fieldsets,prefix);
//        for(var field_name in self.fields)
//        {
//            console.log(field_name);
//            var field = self.fields[field_name];
//            field.name = prefix + field_name;
//            field.render_label(res);
////            res.write(field_name);
//            field.render(res);
//        }
    }
    function render_item(res,i)
    {
        var prefix = self.name + '_li' + i + '_';
        render_list_item(res,self.fields,self.fieldsets,prefix,self.value[i]);
//        for(var field_name in self.fields)
//        {
//            var field = self.fields[field_name];
//            var old_name = field.name;
//            field.name = prefix + old_name;
//            field.value = self.value[i];
//            //field.render_label(res);
//            field.render(res);
//        }
    }
    self.widget.name = self.name;
    self.widget.value = self.value;
    self.widget.render(res,render_template,render_item);
    return self;

//    self.widget.render(res,render_template,render_item);
};