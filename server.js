
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , encoder = require('qrcode')
  , stylus =  require('stylus')
  , nib = require('nib')
  , io = require('socket.io');


var app = express.createServer()
  , io = io.listen(app);

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

    encoder.toDataURL('http://' + req.headers.host + '/ui', function(err, png){

        res.render('index', { 
            title: 'WTFQR',
            image: png
        });
    
    });
  
});


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


app.listen(3000, function(){
  console.log("WTFQR server listening on port %d in %s mode", app.address().port, app.settings.env);
});


// Socket.io

io.sockets.on('connection', function (socket){

  socket.on('setChannel', function (data){
    socket.join(data.channelName);
  });

  socket.on('buttons', function (data){
    console.log(data);

    socket.broadcast.to(data.channelName).emit("raceData", data);

  });

});
