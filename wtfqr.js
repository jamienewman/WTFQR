
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
  , gzippo = require('gzippo');


var app = express.createServer()
  , io = io.listen(app)
  , users = {};

var numPlayers = 8;

//users = {"Twitter98617177":{"name":"Jamie Collins","photoSrc":"http://api.twitter.com/1/users/profile_image?screen_name=Collins1892"},"Facebook505411268":{"name":"Sukhdev Singh Shah","photoSrc":"http://graph.facebook.com/sukhdev.shah/picture"},"Twitter36623029":{"name":"Jasal Vadgama","photoSrc":"http://api.twitter.com/1/users/profile_image?screen_name=donofkarma"}};
var initialUsers = {
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
  for(var i in initialUsers) {
    users[i] = JSON.parse(JSON.stringify(initialUsers[i]));
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
  app.use(express.session({ secret: 'amsid127eyh@wqdoo' }));
  app.use(app.router);

  var oneYear = 31557600000;
  //app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  app.use(gzippo.staticGzip(__dirname + '/public', { clientMaxAge: oneYear, maxAge: oneYear }));
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

  encoder.toDataURL('http://' + req.headers.host + '/join', function(err, png){

    LOL.race.images.qr = png;

    res.render('race', {
      title: 'LBi Olympics',
      images: JSON.stringify(LOL.race.images)
    });
    
  });
});

app.post('/', function(req, res){

  encoder.toDataURL('http://' + req.headers.host + '/join', function(err, png){

    LOL.race.images.qr = png;

    res.render('race', {
      title: 'LBi Olympics',
      images: JSON.stringify(LOL.race.images)
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
});

// Socket.io

io.sockets.on('connection', function (socket){

  socket.on('playerJoin', function (data){
    console.log("Current users: "+JSON.stringify(users));

    var i = 0;

    var photos = [];

    var remainingPlayers = LOL.numPlayers;

    for(var j in users) {
      remainingPlayers--;
    }

    console.log('Remaining: '+remainingPlayers);

    LOL.remainingPlayers = remainingPlayers;
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

  socket.on('debugMove', function(data){
    console.log("Debug move: "+data.toString());

    var j = 0;

    for(var i in LOL.users) {
      if(j === parseInt(data.player)) {
        LOL.race.registerMove(i,'left');
        LOL.race.registerMove(i,'right');
        LOL.race.registerMove(i,'left');
        LOL.race.registerMove(i,'right');
        LOL.race.registerMove(i,'left');
        LOL.race.registerMove(i,'right');
        LOL.race.registerMove(i,'left');
        LOL.race.registerMove(i,'right');
      }
      j++;
    }
  });

  socket.on('disconnect', function(data){
    console.log('DISCONNECTING');
  });

  socket.on('setChannel', function (data){
    socket.join(data.channelName);
  });

  socket.on('buttons', function (data){
    LOL.race.registerMove(data.userId, data.foot);
  });

});

var LOL = LOL || {};

LOL.race = {
    stage: "",
    numWinners: 0,
    playersFinished: 0,
    status: "",
    debugMode: true,
    timer: null,
    images: {
        bg: '/img/bg-full.png',
        r1: '/img/runner1.png',
        r1s2: '/img/runner1_2.png',
        r2: '/img/runner2.png',
        r2s2: '/img/runner2_2.png',
        r3: '/img/runner3.png',
        r3s2: '/img/runner3_2.png',
        r4: '/img/runner4.png',
        r4s2: '/img/runner4_2.png'
    },
    drawBuffer: [],

    sendDrawBuffer: function() {
      console.log('drawing');
      console.log(LOL.race.drawBuffer);
      if(typeof io.sockets !== "undefined") {
        io.sockets.emit('raceData', {
          canvasData: LOL.race.drawBuffer
        });
      }
    },

    reset: function() {
        io.sockets.emit('resetRace', {});
        users = {};
        console.log("USERSBR:");
        console.log(users);
        initUsers();
        console.log("USERS:");
        console.log(users);
        LOL.race.init();
    },

    stages: {
        opening: function() {
            //LOL.race.showOpeningCeremony();
            LOL.race.nextStage();
        },    
        heat1: function() {
            LOL.race.stageName = "Heat 1";
            LOL.race.numWinners = 2;
            LOL.race.setupNewRace();
            LOL.race.setupPlayers();
            LOL.race.showRace();
        },
        heat2: function() {
            LOL.race.stageName = "Heat 2";
            LOL.race.numWinners = 2;
            LOL.race.setupNewRace();
            LOL.race.setupPlayers();
            LOL.race.showRace();
        },
        finals: function() {
            LOL.race.stageName = "Finals";
            LOL.race.numWinners = 3;
            LOL.race.setupNewRace();
            LOL.race.setupPlayers();
            LOL.race.showRace();
        },
        podium: function() {
            LOL.race.setupNewRace();
            LOL.race.setupPlayers();
            LOL.race.showPodium();
        }
    },
/*
    debug: function() {
        $(window).bind('keypress', function(e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if(code >= 49 && code <= 52) { 
                var player = code - 49;

                var i = 0;

                for(var userId in LOL.users) {
                    if(i++ == player) {
                        LOL.race.registerMove(userId, "left");
                        LOL.race.registerMove(userId, "left");
                        LOL.race.registerMove(userId, "left");
                        LOL.race.registerMove(userId, "left");
                        LOL.race.registerMove(userId, "left");
                        LOL.race.registerMove(userId, "left");
                        LOL.race.registerMove(userId, "left");
                        LOL.race.registerMove(userId, "left");
                        LOL.race.registerMove(userId, "left");
                        LOL.race.registerMove(userId, "left");
                    }
                }
            }
        });
    },
*/
    registerMove: function(userId, foot) {
        if(LOL.users[userId].playing === true) {
            console.log("RACING USER: "+userId);
            console.log("RACING USER X: "+LOL.users[userId].x);
            if (LOL.race.status !== "started"){
                return;
            }

            if(foot == 'left') {
                if(LOL.users[userId].imageId.indexOf('s2') >= 0) {
                    LOL.users[userId].imageId = LOL.users[userId].imageId.replace('s2', '');
                }
            }

            if(foot == 'right') {
                if(LOL.users[userId].imageId.indexOf('s2') < 0) {
                    LOL.users[userId].imageId = LOL.users[userId].imageId + 's2';
                }
            }      

            LOL.users[userId].x += LOL.steps;

            console.log("RACING USER NEW X: "+LOL.users[userId].x);
        }
    },

    init: function() {
      LOL.competition = {};
      LOL.race.drawBuffer = [];
      LOL.width = 810;
      LOL.height = 1100;
      LOL.numPlayers = numPlayers;
      LOL.users = users;
      console.log("LOL.USERS:");
      console.log(LOL.users);
      LOL.remainingPlayers = LOL.numPlayers;
      for(var i in LOL.users) { 
          LOL.remainingPlayers--;
      }
      LOL.race.showWaiting();
    },

    start: function() {
        LOL.competition = new Competition(LOL.numPlayers,LOL.users);
        /*if(LOL.race.debugMode === true) {
            LOL.race.debug();
        }*/
        LOL.race.nextStage();
    },

    nextStage: function() {
        LOL.race.playersFinished = 0;

        LOL.competition.nextStage();

        LOL.race.stage = LOL.competition.getCurrentStage();

        LOL.race.stages[LOL.race.stage]();
    },

    setupNewRace: function() {
        LOL.race.status = "starting";

        LOL.steps = 3,
        LOL.xStart = 10,
        LOL.yStart = 261,
        LOL.xOffset = 90,
        LOL.yOffset = 90,
        LOL.key1 = false,
        LOL.key2 = false,
        LOL.key3 = false,
        LOL.key4 = false,
        LOL.framenumber = 0,
        LOL.nextPosition = 1,
        LOL.countdown = 4;
    },

    setupPlayers: function() {
        var i = 0;

        console.log("Users: "+LOL.users.toString());

        LOL.users = LOL.competition.getRacers();

        for(var userId in LOL.users) {
            LOL.users[userId].x = LOL.xStart;
            LOL.users[userId].y = (LOL.yStart + (LOL.yOffset * i++));
            LOL.users[userId].imageId = 'r'+i+'';
            LOL.users[userId].playing = true;
            LOL.users[userId].position = null;
            io.sockets.emit('playerState', {
                'username': userId,
                'state': 'playing'
            });
        }

        console.log(LOL.users);
    },

    drawRect: function(x, y, width, height) {
        LOL.race.drawBuffer.push({
            type: "rect",
            x: x,
            y: y,
            width: width,
            height: height
        });
    },

    drawImage: function(imageId, x, y, width, height) {
        if(width === null && height === null) {
            LOL.race.drawBuffer.push({
                type: "image",
                imageId: imageId,
                x: x,
                y: y
            });
        } else {
            LOL.race.drawBuffer.push({
                type: "image",
                imageId: imageId,
                x: x,
                y: y,
                width: width,
                height: height
            });
        }
    },

    drawText: function(text,x,y,font,textAlign,fillStyle,strokeStyle) {
        LOL.race.drawBuffer.push({
            type: "text",
            text: text,
            x: x,
            y: y,
            font: font,
            textAlign: textAlign,
            fillStyle: fillStyle,
            strokeStyle: strokeStyle
        });
    },

    showWaiting: function() {
      console.log('waiting');
        console.log(LOL.remainingPlayers);
        if(LOL.remainingPlayers > 0) {

            setTimeout(LOL.race.showWaiting, 100);

            LOL.race.drawBuffer = [];

            LOL.race.drawRect(0,0, LOL.width, LOL.height);

            LOL.race.drawImage('bg', -150, 0, null, null);
            LOL.race.drawImage('qr', 265, 80, 300, 300);

            /*

            var xPos = 200,
                yMultiplier = 1;
                
            align = "right";

            for(var userId in LOL.users) {
                if(yMultiplier > 4) {
                    yMultiplier = 1;
                    xPos = 580;
                    align = "left";
                }
                //LOL.race.drawImage(LOL.users[userId].photoSrc, xPos, (80 * yMultiplier++), 50, 50);
                //LOL.race.drawText(LOL.users[userId].name, xPos, (80 * yMultiplier++), "bold 36px sans-serif", align, "black", "black");
            }

            */

            LOL.race.drawText("Waiting for "+LOL.remainingPlayers+ " players", (LOL.width /2), 450, "bold 36px sans-serif", "center", "black", "black");
        } else {
            LOL.race.start();
        }
        LOL.race.sendDrawBuffer();
    },

    showOpeningCeremony: function() {
      console.log('ceremony');
        if(LOL.canvasY <= LOL.canvasMaxY) {
            LOL.race.drawBuffer = [];

            setTimeout(LOL.race.showOpeningCeremony, 100);

            LOL.race.drawRect(0,0, LOL.width, LOL.height);
            
            LOL.race.drawImage('bg', -150, parseInt("-"+(++LOL.canvasY), 10));

            LOL.race.sendDrawBuffer();
        } else {
            LOL.race.nextStage();
        }
        
        /*
        var themeAudio = document.getElementById('audio');
        themeAudio.play();
        */
    },

    showRace: function(){
        console.log('race');
        if(LOL.race.status.indexOf("start") >= 0) {
            LOL.race.drawBuffer = [];

            setTimeout(LOL.race.showRace, 100);

            LOL.race.drawRect(0,0, LOL.width, LOL.height);
            
            LOL.race.drawImage('bg', -150, -500);
                
            LOL.framenumber++;

            //LOL.ctx.font = "bold 72px sans-serif";
            //LOL.ctx.textAlign = "center";
            
            if (LOL.countdown === 4){
                LOL.race.drawText(LOL.race.stage.toUpperCase(), (LOL.width /2), 350, "bold 72px sans-serif", "center", "black", "black");
            } else {

                if (LOL.countdown >= 1){
                    LOL.race.drawText(LOL.countdown, (LOL.width /2), 350, "bold 72px sans-serif", "center", "black", "black");
                }

                if (LOL.countdown === 0){
                    LOL.race.drawText("GO", (LOL.width /2), 350, "bold 72px sans-serif", "center", "black", "black");
                    LOL.race.status = "started";  
                }
            }

            if (LOL.framenumber % 10 === 0 && LOL.countdown >= 0){
                LOL.countdown--;
            }

            for(var userId in LOL.users) {
                try {
                    var nameText = LOL.users[userId].name + (LOL.users[userId].position !== null ? " ("+LOL.users[userId].position+")":"");
                    LOL.race.drawText(nameText, 100, (LOL.users[userId].y+55), "bold 20px sans-serif", "left", "black", "black");
                    LOL.race.drawImage(LOL.users[userId].imageId, LOL.users[userId].x, LOL.users[userId].y);
                } catch(e) {
                    console.log(LOL.users);
                    console.log(userId);
                }
                
                if(LOL.users[userId].x >= 776 && LOL.users[userId].playing === true) {
                    LOL.race.playersFinished++;                
                    LOL.users[userId].playing = false;
                    LOL.users[userId].position = LOL.nextPosition;
                    io.sockets.emit('playerFinished', {
                        'username': userId,
                        'position': LOL.nextPosition++
                    });

                    io.sockets.emit('playerState', {
                        'username': userId,
                        'state': 'winner',
                        'position': '1st',
                        'stage': LOL.race.stage
                    });

                    LOL.competition.setWinner(userId,LOL.race.stage,LOL.users[userId].position);

                    if(LOL.race.playersFinished >= LOL.race.numWinners) {
                        for(var userId in LOL.users) {
                            if(LOL.users[userId].playing === true) {
                                io.sockets.emit('playerState', {
                                    'username': userId,
                                    'state': 'gameover'
                                });
                            }
                        }
                        LOL.race.status = "finished";
                        LOL.race.drawText("END OF "+LOL.race.stage.toUpperCase(),  LOL.width / 2, 350, "bold 72px sans-serif", "center", "black", "black");
                        LOL.race.drawText("PLEASE WAIT",  LOL.width / 2, 450, "bold 72px sans-serif", "center", "black", "black");
                        setTimeout(LOL.race.nextStage, 5000);
                    }
                }
            }
        }
        LOL.race.sendDrawBuffer();
    },
    showPodium: function() {
      LOL.timer = setTimeout(LOL.race.showPodium, 100);

      LOL.race.drawBuffer = [];

      LOL.race.drawRect(0,0, LOL.width, LOL.height);
      
      LOL.race.drawImage('bg', -150, -500);

      var pos = 1;

      for(var userId in LOL.users) {
        var nameText = pos++ + ". " + LOL.users[userId].name;
        LOL.race.drawText(nameText, 100, (LOL.users[userId].y+55), "bold 20px sans-serif", "left", "black", "black");
      }

      LOL.race.sendDrawBuffer();

      setTimeout(function() {
        clearTimeout(LOL.timer);
        LOL.race.reset();
      }, 5000);
    }
    /*podium: {
        
        carpet: {},
        background: {},
        canvasY: 0,
        canvasMaxY: 362,
        podiumXY: [[425,260],[310,310],[540,340]],
        landingFx : {},

        init: function() {
          
            WTF.users = WTqF.competition.getRacers();

            WTF.clearCanvas();

            WTF.rect(0,0, WTF.width, WTF.height);

            WTF.ctx.drawImage(WTF.background, 0, 0);
            
            WTF.race.podium.audio.src="/audio/cartoonbombdrop.wav";
          WTF.race.podium.audio.play();

            WTF.race.podium.carpet = new Image();
            WTF.race.podium.carpet.onload = function () {
                WTF.ctx.drawImage(WTF.race.podium.carpet, 0, 480);
            };
            WTF.race.podium.carpet.src = '/img/red-carpet.png';
            WTF.race.podium.background = new Image();
            WTF.race.podium.background.onload = function () {
                WTF.ctx.drawImage(WTF.race.podium.background, 300, WTF.race.podium.canvasMaxY);
                WTF.race.podium.animate();
            };
            WTF.race.podium.background.src = '/img/podium.png';

            WTF.ctx.save();

        },

        animate: function() {
          
            if (WTF.race.podium.canvasY <= WTF.race.podium.canvasMaxY) {
                WTF.ctx.rotate(0);
                requestAnimationFrame(WTF.race.podium.animate);
                WTF.clearCanvas();

                WTF.rect(0,0, WTF.width, WTF.height);

                WTF.ctx.drawImage(WTF.background, 0, parseInt("-"+WTF.canvasMaxY));
                WTF.ctx.drawImage(WTF.race.podium.carpet, 0, 480);
                WTF.race.podium.canvasY = WTF.race.podium.canvasY + 7;
                if (WTF.race.podium.canvasY >= 360) {
                    WTF.ctx.translate(-100, 140);
                    WTF.ctx.rotate(-0.23);
                }
                WTF.ctx.drawImage(WTF.race.podium.background, 300, parseInt(WTF.race.podium.canvasY, 10));
            } else {
              WTF.race.podium.audio.pause();
              WTF.race.podium.audio.src="/audio/ball_bounce.wav";
              WTF.race.podium.audio.play();
                WTF.ctx.restore();
                WTF.race.podium.drawImages();
            }
        },

        drawImages: function () {
            var i = 0;

            for(var userId in WTF.users) {
                var podiumPlayer = new Image();
                var positionIndex = WTF.users[userId].position-1;

                (function (podiumPlayer,positionIndex) {
                    podiumPlayer.onload = function () {
                        WTF.ctx.drawImage(podiumPlayer, WTF.race.podium.podiumXY[positionIndex][0], WTF.race.podium.podiumXY[positionIndex][1], 90, 90);
                    };
                }(podiumPlayer,positionIndex));               
                podiumPlayer.src = WTF.users[userId].photo.src;

                i++;
            }
            
            WTF.race.podium.playApplause();
            
        },
        
        playApplause: function () {
          WTF.race.podium.audio.addEventListener("ended", function() {
              WTF.race.podium.audio.src = "/audio/applause-8.wav";
              WTF.race.podium.audio.play();
              WTF.race.podium.audio.addEventListener("ended", function() {
                WTF.race.podium.audio.pause();
            });
        });

            window.setTimeout(WTF.race.reset, 5000);
        }
        
    }
    */
};

function Competition(numPlayers,userData) {
    this.numPlayers_ = numPlayers;
    this.userData_ = userData;

    this.categorisedUsers_ = {};

    this.states_ = ["waiting","opening","heat1","heat2","finals","podium"];
    this.finalPosition_ = 1;

    for(var i=0; i<this.states_.length; i++) {
        this.categorisedUsers_[this.states_[i]] = {};
    }

    var i = 0;

    for(var userId in userData) {
        var currentState = {};
        if(i < 4) {
            currentState = this.categorisedUsers_[this.states_[2]];
        } else {
            currentState = this.categorisedUsers_[this.states_[3]];
        }

        currentState[userId] = userData[userId];

        i++;
    }

    this.stateIndex_ = 0;
};

Competition.prototype.getCurrentStage = function () {
    return this.states_[this.stateIndex_];
};

Competition.prototype.nextStage = function () {
    this.stateIndex_++;
    return;
};

Competition.prototype.getRacers = function () {
    console.log(this.stateIndex_,this.states_[this.stateIndex_],this.categorisedUsers_[this.states_[this.stateIndex_]])
    return this.categorisedUsers_[this.states_[this.stateIndex_]];
};

Competition.prototype.setWinner = function (userId,stage,position) {
    var finalState = {};
    if(stage.indexOf('heat') >= 0) {
        finalState = this.categorisedUsers_[this.states_[4]];
        finalState[userId] = this.userData_[userId];
    } else if (stage.indexOf('finals') >= 0) {
        finalState = this.categorisedUsers_[this.states_[5]];
        finalState[userId] = this.userData_[userId];
        finalState[userId].position = position;
    }
};

LOL.race.init();
