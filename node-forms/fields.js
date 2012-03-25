var widgets = require('./widgets'),
    async = require('async'),
    common = require('./common');
var _extends = common._extends;
var mongoose = null;
try
{
    mongoose = require('mongoose');
}
catch(e)
{
    console.log('couldnt get mongoose');
}

var BaseField = exports.BaseField = function(options) {
    options = options || {};
    this['default'] = options['default'];
    this.required = options.required != null ? options.required : false;
    this.validators = options.validators || [];
    var widget_options = options.widget_options || {};
    widget_options.attrs = options.attrs || {};
    widget_options.required = widget_options.required != null ? widget_options.required : this.required;
    this.widget = new options.widget(widget_options);
    this.value = null;
    this.errors = [];
    this.name = '';
    this.label = options.label;
};

BaseField.prototype.to_schema = function()
{
    var schema = {};
    if(this.required)
        schema['required'] = true;
    if(this['default'])
        schema['default'] = this['default'];
    return schema;
};


BaseField.prototype.get_label = function()
{
    var label = this.label || this.name;
    var arr =  label.split('_');
    for(var i=0; i<arr.length; i++)
    {
        arr[i] = arr[i][0].toUpperCase() + arr[i].substring(1);
    }
    return arr.join(' ');
}

BaseField.prototype.render_label = function(res)
{
    res.write('<label for="id_' + this.name + '">' + this.get_label() + '</label>');
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

BaseField.prototype.render_with_label = function(res)
{
    res.write('<label for="id_' + this.name + '"><span>' + this.get_label() + '</span>');
    this.render_error(res);
    this.render(res);
    res.write('</label>');
};

BaseField.prototype.render_with_label_str = function()
{
    return common.writer_to_string(this.render_with_label,1024);
};

BaseField.prototype.render_error = function(res)
{
    if(this.errors || this.errors.length)
    {
        for(var i=0; i<this.errors.length; i++)
        {
            res.write('<span class="error">');
            res.write(this.errors[i] + '');
            res.write('</span>');
        }
    }
};

BaseField.prototype.set = function(value,req)
{
    this.value = (typeof(value) == 'undefined' || value == null) ? this['default'] : value;
    return this;
};

BaseField.prototype.clean_value = function(req,callback)
{
    if(this.value == '')
        this.value = null;
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
    this.type = 'string';
});

StringField.prototype.set = function(value,req)
{
    return StringField.super_.prototype.set.call(this,value,req);
};

StringField.prototype.to_schema = function()
{
    var schema = StringField.super_.prototype.to_schema.call(this);
    schema['type'] = String;
    return schema;
};

var ReadonlyField = exports.ReadonlyField = _extends(BaseField,function(options)
{
    options = options || {};
    options.widget = options.widget || widgets.HiddenWidget;
    ReadonlyField.super_.call(this,options);
});

ReadonlyField.prototype.render_label = function(res)
{

};

ReadonlyField.prototype.render_with_label = function(res)
{
//    res.write('<label><span>');
    this.render(res);
//    res.write('</span></label>');
};

var BooleanField = exports.BooleanField = _extends(BaseField, function(options) {
    options = options || {};
    options.widget = options.widget || widgets.CheckboxWidget;
    BooleanField.super_.call(this,options);
});


BooleanField.prototype.to_schema = function()
{
    var schema = BooleanField.super_.prototype.to_schema.call(this);
    schema['type'] = Boolean;
    return schema;
};

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
    options.required = true;
    EnumField.super_.call(this,options);
});

EnumField.prototype.to_schema = function()
{
    var schema = EnumField.super_.prototype.to_schema.call(this);
    schema['type'] = String;
    schema['enum'] = this.choices;
    return schema;
};

EnumField.prototype.clean_value = function(req,callback)
{
//    var found = false;
//    for(var i=0; i<this.choices.length; i++)
//    {
//        if(this.choices[i] == this.value)
//            found = true;
//    }
//    if(this.value === null || this.value == '')
//    {
//        this.value = null;
//        found = true;
//    }
//    if(!found)
//        this.errors = ['possible values are: ' + this.choices];
//        this.value = null || this['default'];
    if(this.value == '')
        this.value = null;
    EnumField.super_.prototype.clean_value.call(this,req,callback);
    return this;
};


var RefField = exports.RefField = _extends(EnumField,function(options,ref)
{
    this.ref = ref;
    if(!this.ref)
        throw new TypeError('Model was not provided');
    options = options || {};
    var required = options ? (options.required != null ? options.required : false) : false;
    options.widget = options.widget || widgets.RefWidget;
    options.widget_options = options.widget_options || {};
    options.widget_options.ref = options.widget_options.ref || ref;
    options.widget_options.required = options.required;
    RefField.super_.call(this,options,[]);
    this.required = required;
});

RefField.prototype.to_schema = function()
{
    var schema = RefField.super_.prototype.to_schema.call(this);
    schema['type'] = require('mongoose').Schema.ObjectId;
    schema['ref'] = this.ref + '';
    return schema;
};

var NumberField = exports.NumberField = _extends(StringField,function(options)
{
    options = options || {};
    options.widget = options.widget || widgets.NumberWidget;
    NumberField.super_.call(this,options);
});

NumberField.prototype.to_schema = function()
{
    var schema = NumberField.super_.prototype.to_schema.call(this);
    schema['type'] = Number;
    return schema;
};

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

DateField.prototype.to_schema = function()
{
    var schema = DateField.super_.prototype.to_schema.call(this);
    schema['type'] = Date;
    return schema;
};

var ListField = exports.ListField = _extends(BaseField,function(options,fields,fieldsets)
{
    options = options || {};
    options['default'] = options['default'] || [];
    options.widget = options.widget || widgets.ListWidget;
    ListField.super_.call(this,options);
    this.fields = fields;
    this.fieldsets = fieldsets;
});

ListField.prototype.to_schema = function()
{
    var schema = ListField.super_.prototype.to_schema.call(this);
    schema['type'] = Array;
    return schema;
};

ListField.prototype.clean_value = function(req,callback)
{
    var self = this;
    var prefix = self.name + '_li';
    this.value = [];
    var clean_funcs = [];
    var inner_body = {};
    function create_clean_func(field_name,post_data,output_data)//num,name,value)
    {
        return function(cbk)
        {
            var field = self.fields[field_name];
            field.name = field_name;
            var old_body = req.body;
            var request_copy = {};
            for(var key in req)
                request_copy[key] = req[key];
            request_copy.body = post_data;
            field.set(post_data[field_name],request_copy);
            field.clean_value(request_copy,function(err)
            {
                if(field.errors && field.errors.length)
                    this.errors = Array.concat(self.errors,field.errors);
                else
                {
                    output_data[field_name] = field.value;
//                    if(name == '__self__')
//                        values[num] = field.value;
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
            var data = inner_body[num] || {};
            inner_body[num] = data;
            data[name] = req.body[field_name];
            //clean_funcs.push(create_clean_func(num,name,req.body[field_name]));
        }
    }
    for(var key in inner_body)
    {
        var output_data = {};
        this.value.push(output_data);
        for(var field_name in self.fields)
        {
            clean_funcs.push(create_clean_func(field_name,inner_body[key],output_data));
        }
    }
    async.parallel(clean_funcs,function(err)
    {
        for(var i=0; i<self.value.length; i++)
        {
            if('__self__' in self.value[i])
                self.value[i] = self.value[i].__self__;
        }
        callback(null);
    });
    return self;
};

ListField.prototype.pre_render = function(callback)
{
    var funcs = [];
    var self = this;

    function pre_render_partial(field)
    {
        return function(cbk) {
            self.fields[field].pre_render(function(err,results)
            {
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
       callback(err);
    });
    return self;
};

function render_list_item(res,fields,fieldsets,prefix,value)
{
    var options = {};
    function render_fields(fields)
    {
        for(var i=0; i<fields.length; i++)
        {
            var field_name = fields[i];
            if(typeof(field_name) == 'object')
                render_fieldset(field_name);
            else
                render_field(field_name);
        }
    };
    function render_field(field_name)
    {
        fields[field_name].name = prefix + field_name;
        if(field_name != '__self__')
        {
            fields[field_name].value = value ? value[field_name] : null;
            fields[field_name].render_with_label(res);
        }
        else
        {
            fields[field_name].value = value;
            fields[field_name].render(res);
        }
    };

    function render_fieldset(fieldset)
    {
        if(fieldset['title'] && fieldset['title'] != '')
            res.write('<div class="nf_fieldset">');
        var title = fieldset['title'] || '';
        if(title != '')
            res.write('<h2>' + title + '</h2>');
        var fields = fieldset.fields;
        if(fields)
            render_fields(fields);
        if(fieldset['title'] && fieldset['title'] != '')
            res.write("</div>");
    };
    if(fieldsets)
    {
        render_fields(fieldsets[0].fields);
    }
    else
        render_fields(Object.keys(fields));
}

ListField.prototype.render = function(res)
{
    var self = this;
    function render_template(res)
    {
        var prefix = self.name + '_tmpl_';
        render_list_item(res,self.fields,self.fieldsets,prefix);
    }
    function render_item(res,i)
    {
        var prefix = self.name + '_li' + i + '_';
        render_list_item(res,self.fields,self.fieldsets,prefix,self.value[i]);
    }
    self.widget.name = self.name;
    self.widget.value = self.value;
    self.widget.render(res,render_template,render_item);
    return self;
};


var FileField = exports.FileField = _extends(BaseField,function(options)
{
    options = options || {};
    options.widget = options.widget || widgets.FileWidget;
    this.directory = options.upload_to || __dirname + '\\..\\public\\cdn';
    FileField.super_.call(this,options);
});


FileField.prototype.to_schema = function()
{
//    var schema = FileField.super_.prototype.to_schema.call(this);
//    schema.type = F;
    return FileField.Schema;
};
var fs = require('fs');
var util = require('util');

FileField.prototype.create_filename = function(file)
{
    return '/' + (Date.now()%1000) + file.name;
};

FileField.prototype.clean_value = function(req,callback)
{
    var self = this;
    self.value = self.value || {};
    function on_finish()
    {
        FileField.super_.prototype.clean_value.call(self,req,callback);
    }
    function after_delete(err)
    {
        if(req.files[self.name] && req.files[self.name].name)
        {
            // copy file from temp location
            var is = fs.createReadStream(req.files[self.name].path);
            var filename = self.create_filename(req.files[self.name]);
            var os = fs.createWriteStream(self.directory + filename);

            util.pump(is, os, function(err) {
                fs.unlink(req.files[self.name].path,function(err)
                {
                    self.value = {path:filename,size:req.files[self.name].size};
                    on_finish();
                });
            });
        }
        else
        {
            self.value = null;
            on_finish();
        }
    };
    // delete old file is needed/requested
    if(self.value && self.value.path && (req.body[self.name + '_clear'] || req.files[self.name] && req.files[self.name].name))
    {
        fs.unlink(self.directory + self.value.path,after_delete);
        self.value = null;
    }
    else
    {
        after_delete();
    }

};

FileField.Schema = {
    url:String,
    name:String,
    size:Number
};

var GeoField = exports.GeoField = _extends(BaseField,function(options)
{
    options = options || {};
    options.widget = options.widget || widgets.MapWidget;
    GeoField.super_.call(this,options);
});

GeoField.prototype.clean_value = function(req,callback)
{
    var str = this.value;
    var parts = str.split(',');
    if(parts.length != 2 || parts[0] == '' || parts[1] == '')
        this.value = null;
    else
    {
        this.value = { lat: Number(parts[0]), lng:Number(parts[1])};
        if(this.name + '_address' in req.body)
        {
            this.value.address = req.body[this.name + '_address'];
        }
    }
    GeoField.super_.prototype.clean_value.call(this,req,callback);
};