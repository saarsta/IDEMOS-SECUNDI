var j_forms = require('j-forms');

module.exports = j_forms.forms.AdminForm.extend({
    render:function(res,options) {
        this._super(res,options);
        var instance = this.instance;
        res.write(instance.getCharCount() + '');
    }
});