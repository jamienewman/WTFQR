
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
  , io = io.listen(app);

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
            image: png
        });
    
    });
  
});

app.get('/join', function(req, res){
  passport.use(new TwitterStrategy({
      consumerKey: '6olMOiTALuonaaOkJ9sjQ',
      consumerSecret: '2nwMhMl5ihSYo1MDqGi7B9TVQO7A7PS0pnpDF3pDc9c',
      callbackURL: "http://"+req.headers.host+"/auth/twitter/callback"
    },
    function(token, tokenSecret, profile, done){
       process.nextTick(function () {
        return done(null, profile);
      });
    }
  ));

  passport.use(new FacebookStrategy({
      clientID: '328866273857515',
      clientSecret: '90a2283a9f1ead52d138c64de737710b',
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
      successRedirect: '/ui',
      failureRedirect: '/join/failure' 
  })
);

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { 
      successRedirect: '/ui',
      failureRedirect: '/join/failure' 
  })
);

app.get('/race', function(req, res){

  res.render('race', {
    title: 'WTFQR Race'
  });

});


app.get('/ui', function(req, res){

  res.render('mobileui', {
    title: 'Win The Race!!'
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
});

var users = [];

// Socket.io

io.sockets.on('connection', function (socket){

  socket.on('setName', function (data){
    users.push(data.username);
    console.log("Current users: "+users.toString());

    socket.broadcast.to(data.channelName).emit("playerData", users);
  });

  socket.on('removeName', function(data){
    console.log('Removing user '+data.username);
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

});
