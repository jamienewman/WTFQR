// requestAnimationFrame shim
(function(){
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

function ord(n){
    n=n+'';
    var l=n.length, r=parseInt(n.substring(l-2,l)), i = n % 10;
    return ((r < 11 || r > 19) && (i < 4)) ? ['th','st','nd','rd'][i] : 'th';
}

var WTF = WTF || {};

WTF.socket = io.connect( window.location.origin );

window.fbAsyncInit = function() {
    FB.init({
      appId      : '251624868290027', 
      status     : true, 
      frictionlessRequests : true,
      cookie     : true, 
      xfbml      : true  
    });

// Additional initialization code here
};
(function(d){
 var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement('script'); js.id = id; js.async = true;
 js.src = "//connect.facebook.net/en_US/all.js";
 ref.parentNode.insertBefore(js, ref);
}(document));


(function() {
  var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
  po.src = 'https://apis.google.com/js/plusone.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
})();


!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");

// This function when initiated via a user click 
// renders the FB dialog to invite friends to the app
WTF.inviteFriends = function(){
  FB.ui({
    method: 'apprequests',
    title: 'LBi Olympics',
    message: 'Compete in the LBi Olympics! Scan the QR code with your phone and use your phone as a remote control in the race!'
  }, function(resp){
    console.log(resp);
  });
};

// This function when initiated via a user click 
// renders the FB dialog to share to my wall
WTF.shareToWall = function(){
  FB.ui({
    method: 'feed',
    link: 'http://www.facebook.com/LBiUK/app_251624868290027',
    picture: 'http://lbi-olympics.nodejitsu.com/img/logo_LBi_red.gif',
    name: 'LBi Olympics',
    caption: 'LBi Olympics',
    description: 'Compete in the LBi Olympics! Scan the QR code with your phone and use your phone as a remote control in the race!'
  }, function(resp){
    console.log(resp);
  });
};

