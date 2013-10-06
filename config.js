var config = {};

// facebook app params
config.fb_auth_params = {
    appId : process.env['FACEBOOK_APPID'] || '175023072601087',
    appSecret: process.env['FACEBOOK_SECRET'] || '5ef7a37e8a09eca5ee54f6ae56aa003f',
    appName: process.env['FACEBOOK_APPNAME'] || 'uru_dev',
    callback: config.ROOT_PATH + '/account/facebooklogin',
    scope: 'email,publish_actions',
    failedUri: '/noauth'
};

config.fb_general_params = {
    fb_title: 'עורו',
    fb_description:  "עורו היא תנועה חברתית לייצוג הרוב בישראל. אנו מאמינים שבעידן שבו אנו חיים, כולנו מסוגלים וזכאים להשתתף בקבלת ההחלטות. לכן, עורו מנהלת פלטפורמה לדיון ציבורי, יסודי ואפקטיבי שיוביל שינוי בסדר היום. אצלנו, האג'נדה מוכתבת מלמטה.",
    fb_image: 'http://site.e-dologic.co.il/philip_morris/Xls_script/uru_mailing/logo.jpg'
}

// amazon s3 credentials
config.s3_creds = {
    key: 'AKIAJM4EPWE637IGDTQA',
    secret: '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',
    bucket: 'uru'
};
config.sendgrid_user = 'app2952775@heroku.com';
config.sendgrid_key = 'a0oui08x';
config.system_email = 'admin@uru.org.il';




config.DB_URL = process.env['MONGOLAB_URI'] || 'mongodb://localhost/idemos';
config.ROOT_PATH = process.env.ROOT_PATH || 'http://dev.empeeric.com';

module.exports = config;