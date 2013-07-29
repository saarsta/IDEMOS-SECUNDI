

var FIND_USER_QUERY = exports.FIND_USER_QUERY = '/__value__/i.test(this.email) || /__value__/i.test(this.first_name) || /__value__/i.test(this.last_name)';

var FIND_DISCUSSION_QUERY = exports.FIND_DISCUSSION_QUERY = '/__value__/i.test(this.title) || /__value__/i.test(this.text_field_preview) ';

exports.SUBJECT_QUERY = '/__value__/i.test(this.name)';