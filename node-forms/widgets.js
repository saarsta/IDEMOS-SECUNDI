
var _extends = require('./common')._extends;


var Widget = exports.Widget = function(options)
{
    this.required = options.required || false;
    this.attrs = options.attrs || {};
    this.validators = options.validators || [];
    this.attrs = options.attrs || {};
    this.attrs.class = this.attrs.class || [];
    this.attrs.class.push(this.required ? 'required_label' : 'optional_label');
    this.name = '';
    this.value = null;
};

Widget.prototype.pre_render = function(callback)
{
    callback(null);
}

Widget.prototype.render = function(res)
{
    return this;
};

Widget.prototype.render_attributes = function(res)
{
    this.attrs['name'] = this.name;
    this.attrs['id'] = 'id_' + this.name;
    for(var attr in this.attrs)
    {
        var value = Array.isArray(this.attrs[attr]) ? this.attrs[attr].join(' ') : this.attrs[attr];
        res.write(' ' + attr + '="' + value + '"');
    }
    return this;
};

var InputWidget = exports.InputWidget = _extends(Widget,function(type,options)
{
    options.attrs.type = options.attrs.type || type;
    InputWidget.super_.call(this,options);
});

InputWidget.prototype.render = function(res)
{
    res.write('<input value="' + (this.value != null ? this.value :  '') + '"');
    this.render_attributes(res);
    res.write(' />');
    return this;
};

var HiddenWidget = exports.HiddenWidget = _extends(InputWidget,function(options)
{
    HiddenWidget.super_.call(this,'hidden',options);
});

var TextWidget = exports.TextWidget = _extends(InputWidget,function(options)
{
    TextWidget.super_.call(this,'text',options); 
});

var DateWidget = exports.DateWidget = _extends(InputWidget,function(options)
{
    DateWidget.super_.call(this,'text',options);
    this.attrs.class.push('nf_datepicker');
});

var NumberWidget = exports.NumberWidget = _extends(InputWidget,function(options)
{
    NumberWidget.super_.call(this,'number',options);
});

var CheckboxWidget = exports.CheckboxWidget = _extends(InputWidget,function(options)
{
    CheckboxWidget.super_.call(this,'checkbox',options);
});

CheckboxWidget.prototype.render = function(res)
{
    var old_value = this.value;
    if(this.value)
        this.attrs['checked'] = 'checked';
    this.value = 'on';
    var ret = CheckboxWidget.super_.prototype.render.call(this,res);
    this.value = old_value;
    return ret;

}

var ChoicesWidget = exports.ChoicesWidget = _extends(Widget,function(options)
{
    this.choices = options.choices || [];
    ChoicesWidget.super_.call(this,options);
});

ChoicesWidget.prototype.render = function(res)
{
    if(!this.names)
    {
        this.names = new Array(this.choices.length);
        for(var i=0; i<this.choices.length; i++)
        {
            if(typeof(this.choices[i]) == 'object')
            {
                this.names[i] = this.choices[i][1];
                this.choices[i] = this.choices[i][0];
            }
            else
                this.names[i] = this.choices[i];
        }
    }
    res.write('<select ');
    this.render_attributes(res);
    res.write(' >');
    if(!this.required)
    {
        var selected = this.value ? '' : 'selected="selected" ';
        res.write('<option ' + selected + 'value=""> ---- </option>');
    }
    for(var i=0; i<this.choices.length; i++)
    {
        var selected = this.value == this.choices[i] ? 'selected="selected" ' : '';
        res.write('<option ' + selected + 'value="' + this.choices[i] + '">' + this.names[i] + '</option>');
    }
    res.write('</select>');
    return this;
};

var RefWidget = exports.RefWidget = _extends(ChoicesWidget,function(options)
{
    this.ref = options.ref;
    if(!this.ref)
        throw new TypeError('model was not provided');
    RefWidget.super_.call(this,options);
});

RefWidget.prototype.pre_render = function(callback)
{
    var self = this;
    this.ref.find({},function(err,objects)
    {
        if(err)
            callback(err);
        else
        {
            self.choices = [];
            if(objects.length)
                console.log(objects[0].name);
            for(var i=0; i<objects.length; i++)
                self.choices.push([objects[i].id,objects[i].name || objects[i].title || objects[i].toString()]);
            return RefWidget.super_.prototype.pre_render.call(self,callback);
        }
    });
};

//var UnknownRefWidget = exports.UnknownRefWidget = _extends(ChoicesWidget)
    
var ListWidget = exports.ListWidget = _extends(Widget,function(options)
{
    ListWidget.super_.call(this,options);
});

ListWidget.prototype.render = function(res,render_template,render_item)
{
    res.write("<div class='nf_listfield' name='" + this.name + "'><div class='nf_hidden_template'>");
    render_template(res);
    res.write('</div><ul>');
    this.value = this.value || [];
    for(var i=0; i<this.value.length; i++)
    {
        res.write('<li>');
        render_item(res,i);
        res.write('</li>');
    }
    res.write('</ul></div>');
};

var FileWidget = exports.FileWidget = _extends(InputWidget,function(options)
{
    FileWidget.super_.call(this,'file', options);
});

FileWidget.prototype.render = function(res)
{
    if(this.value && this.value != '')
    {
        res.write('<input type="checkbox" name="' + this.name +'_clear" value="Clear" /> <p>Curret: <a href="' + this.value.url + '">' + this.value.url + '</a></p>');
    }
    FileWidget.super_.prototype.render.call(this,res);
};
    
    
    
    
    
    
    
    
    