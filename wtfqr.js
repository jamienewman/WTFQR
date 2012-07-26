
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , encoder = require('qrcode')
  , stylus =  require('stylus')
  , nib = require('nib')
  , passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , io = require('socket.io')
  , os = require('os');


var app = express.createServer()
  , io = io.listen(app)
  , users = {};

var numPlayers = 8;

//users = {"Twitter98617177":{"name":"Jamie Collins","photoSrc":"http://api.twitter.com/1/users/profile_image?screen_name=Collins1892"},"Facebook505411268":{"name":"Sukhdev Singh Shah","photoSrc":"http://graph.facebook.com/sukhdev.shah/picture"},"Twitter36623029":{"name":"Jasal Vadgama","photoSrc":"http://api.twitter.com/1/users/profile_image?screen_name=donofkarma"}};
initialUsers = {
          "Test1": {"name":"Jamie Newman","photoSrc":"http://api.twitter.com/1/users/profile_image?screen_name=jamienewman"},
          "Test2":{"name":"Jamie Collins","photoSrc":"http://api.twitter.com/1/users/profile_image?screen_name=Collins1892"},
          "Test3":{"name":"Sukhdev Singh Shah","photoSrc":"http://graph.facebook.com/sukhdev.shah/picture"},
          "Test4":{"name":"Jamie Collins","photoSrc":"http://api.twitter.com/1/users/profile_image?screen_name=Collins1892"},
          "Test5":{"name":"Sukhdev Singh Shah","photoSrc":"http://graph.facebook.com/sukhdev.shah/picture"},
          "Test6":{"name":"Jamie Collins","photoSrc":"http://api.twitter.com/1/users/profile_image?screen_name=Collins1892"},
          "Test7":{"name":"Nicola Newman","photoSrc":"http://graph.facebook.com/nicola.newman81/picture"},
        };
//users["Twitter15377059"] = {"name":"Jamie Newman","photoSrc":"http://api.twitter.com/1/users/profile_image?screen_name=jamienewman"};

var initUsers = function() {
  if(initialUsers !== null) {
    users = initialUsers;
  }
};

initUsers();

passport.serializeUser(function(user, done) {
  done(null, user);
});


passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(stylus.middleware({
      src: __dirname + '/public',
      compile: compile
    }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.cookieParser()); 
  app.use(express.session({ secret: 'afhf9q8h21ejhdaskjdlasjda'}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

// Allows for the use of nib plugin for Stylus -- gradient, box-shadow etc mixins

function compile(str, path){
  return stylus(str)
    .set('filename', path)
    .set('compress', true)
    .use(nib())
    .import('nib');
}

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});  


// Routes  
  

app.get('/', function(req, res){

    console.log(req.headers.host);

    encoder.toDataURL('http://' + req.headers.host + '/join', function(err, png){

        res.render('index', { 
            title: 'WTFQR',
            image: png,
            numPlayers: numPlayers
        });
    
    });
  
});

app.get('/join', function(req, res){
  passport.use(new TwitterStrategy({
      consumerKey: '7uAQxgzBKyOd3q4A8WlA',
      consumerSecret: 'cruzj02mzvgx8BgYf3QlN2tE6PkE7OTOgATbIDI9eQ',
      callbackURL: "http://"+req.headers.host+"/auth/twitter/callback"
    },
    function(token, tokenSecret, profile, done){
       process.nextTick(function () {
        return done(null, profile);
      });
    }
  ));

  passport.use(new FacebookStrategy({
      clientID: '251624868290027',
      clientSecret: '15b8c293e689879a88f318d09c694290',
      callbackURL: "http://"+req.headers.host+"/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done){
      process.nextTick(function () {
        return done(null, profile);
      });
    }
  ));

  res.render('join', {
    title: 'Join'
  });
});

app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['publish_actions', 'email']
  }
));


app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { 
    failureRedirect: '/join/failure' 
  }),
  function(req, res) {
    req.session.userId = "Facebook"+req.user.id;
    users[req.session.userId] = {
      name: req.user.displayName,
      photoSrc: "http://graph.facebook.com/"+req.user.username+"/picture"
    }
    res.redirect('/ui');
  }
);

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { 
      failureRedirect: '/join/failure' 
  }),
  function(req, res) {
    req.session.userId = "Twitter"+req.user.id;
    users[req.session.userId] = {
      name: req.user.displayName,
      photoSrc: "http://api.twitter.com/1/users/profile_image?screen_name="+req.user.username
    }
    res.redirect('/ui');
  }
);

app.get('/race', function(req, res){

  encoder.toDataURL('http://' + req.headers.host + '/join', function(err, png){

    res.render('race', {
      title: 'WTFQR Race',
      users: users,
      image: png,
      numPlayers: numPlayers
    });
    
  });
});


app.get('/ui', function(req, res){
  
  res.render('mobileui', {
    title: 'Win The Race!!',
    userId: req.session.userId
  });

});

app.get('/podium', function(req, res) {
	
	res.render('podium', {
		title: 'Awards'
	});
});

var port = process.env.PORT || 3000;

app.listen(port, function(){
  console.log("WTFQR server listening on port %d in %s mode", app.address().port, app.settings.env);
  console.log(users);
});

// Socket.io

io.sockets.on('connection', function (socket){

  socket.on('playerJoin', function (data){
    console.log("Current users: "+JSON.stringify(users));

    var i = 0;

    var photos = [];

    for(var j in users) {
      i++;
    }

    socket.broadcast.to(data.channelName).emit("playerCount", JSON.stringify({
      "number": i,
      "users": users
    }));
  });

  socket.on('playerFinished', function(data){
    users[data.username].position = data.position;

    console.log({
      'username': data.username,
      'position': data.position,
      'stage': data.stage
    });

    socket.broadcast.to(data.channelName).emit("playerFinish", {
      'username': data.username,
      'position': data.position,
      'stage': data.stage
    });
  });

  socket.on('playerState', function(data){
    console.log("Player state: "+data.toString());

    socket.broadcast.to(data.channelName).emit("playerState", data);
  });

  socket.on('disconnect', function(data){
    console.log('DISCONNECTING');
  });

  socket.on('setChannel', function (data){
    socket.join(data.channelName);
  });

  socket.on('buttons', function (data){
    console.log(data);

    socket.broadcast.to(data.channelName).emit("raceData", data);

  });

  socket.on('resetRace', function (data){
    console.log('Resetting');

    initUsers();

    socket.broadcast.to(data.channelName).emit("resetRace");

  });

});
