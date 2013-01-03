<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8"/>
            <title>uru</title>
            <meta name="description" content="uru" />
            <meta property="og:title" content="uru" />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://uru.herokuapp.com/faces_game" />
            <meta property="og:image" content="https://uru.herokuapp.com/faces_game/logo.jpg" />
            <meta property="og:site_name" content="uru" />
            <script src="js/swfobject.js"></script>
            <script>
            var flashvars = {

                };
            var params = {
                menu: "false",
                scale: "noScale",
                allowFullscreen: "true",
                allowScriptAccess: "always",
                bgcolor: "",
                wmode: "transparent" // can cause issues with FP settings & webcam
                };
            var attributes = {
                id:"tzaban",
                name:"tzaban"
                };
            swfobject.embedSWF(
            "main.swf",
            "altContent", "810", "800", "10.0.0",
            "expressInstall.swf",
            flashvars, params, attributes);
            </script>
        </head>
        <body>
            <div id="altContent">
            </div>
            <div id="fb-root"></div>
            <script>
            window.fbAsyncInit = function () {
                // init the FB JS SDK
                FB.init({
                    appId: '313268118784632', // App ID from the App Dashboard
                    channelUrl: 'https://uru.herokuapp.com/channel.html', // Channel File for x-domain communication
                    status: true, // check the login status upon init?
                    cookie: true, // set sessions cookies to allow your server to access the session?
                    xfbml: true // parse XFBML tags on this page?
                });

            // Additional initialization code such as adding Event Listeners goes here

            };

            // Load the SDK's source Asynchronously
            // Note that the debug version is being actively developed and might
            // contain some type checks that are overly strict.
            // Please report such bugs using the bugs tool.
            (function (d, debug) {
                var js, id = 'facebook-jssdk',
                ref = d.getElementsByTagName('script')[0];
                if (d.getElementById(id)) {
                return;
                }
            js = d.createElement('script');
            js.id = id;
            js.async = true;
            js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
            ref.parentNode.insertBefore(js, ref);
            }(document, /*debug*/ false));


            function loginUser() {
                console.log('graphStreamPublish');
                FB.login(function (response) {
                if (response.authResponse) {
                console.log('Welcome! Fetching your information.... ');
                FB.api('/me', function (response) {
                console.log('Good to see you, ' + response.name + '.');

                var fl = document.getElementById('tzaban');
                fl.takeSnapshotForMe(response.name);
                });
            } else {
                console.log('User cancelled login or did not fully authorize.');
                }
            }, {
                scope: 'publish_stream,user_about_me'
                });
            };

            function graphStreamPublish(img) {
                console.log('graphStreamPublish');
                FB.api('/me/feed', 'post', {
                message: "test of the testing",
                link: 'https://uru.herokuapp.com/faces_game',
                picture: img,
                name: 'test',
                description: 'test test test a test'

                },

            function (response) {
                // showLoader(false);

                if (!response || response.error) {
                alert('Error occured');
                } else {
                alert('Post ID: ' + response.id);
                }
            });
            }

            function postToFeed() {

                // calling the API ...
                var obj = {
                method: 'feed',
                redirect_uri: 'https://uru.herokuapp.com/faces_game',
                link: 'https://uru.herokuapp.com/faces_game',
                picture: 'https://uru.herokuapp.com/faces_game/logo.jpg',
                name: 'Facebook Dialogs',
                caption: 'Reference Documentation',
                description: 'Using Dialogs to interact with users.'
                };

            function callback(response) {
                //document.getElementById('msg').innerHTML = "Post ID: " + response['post_id'];
                }

            FB.ui(obj, callback);
            }
            </script>


        </body>
    </html>