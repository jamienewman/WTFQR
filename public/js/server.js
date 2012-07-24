WTF.socket.on('connect', function (data){
    
    WTF.socket.emit('setChannel', {
        'channelName': 'Race'
    });

    WTF.socket.on('playerCount', function(data){
        if(WTF.race.status === "waiting") {
            var data = JSON.parse(data);

            WTF.remainingPlayers = WTF.numPlayers - parseInt(data.number);

            WTF.users = data.users;

            WTF.race.showWaiting();
        }
    });

    WTF.socket.on('raceData', function(data){
       WTF.race.registerMove(data.userId, data.foot);
    });

});

WTF.setupCanvas = function() {
    WTF.race.status = "waiting";

    if(WTF.canvas = document.getElementById('canvas')) {
        WTF.ctx = WTF.canvas.getContext('2d');
        
        WTF.width = 960;
        WTF.height = 1100;

        WTF.background = new Image();
        WTF.background.onload = function() {
            WTF.race.init();
        };
        WTF.background.src = 'img/bg-full.png';
    }
};

WTF.clearCanvas = function(){
    WTF.ctx.clearRect(0, 0, WTF.width, WTF.height);
};

WTF.rect = function(x,y,w,h){
    WTF.ctx.beginPath();
    WTF.ctx.rect(x,y,w,h);
    WTF.ctx.closePath();
    WTF.ctx.fill();
    WTF.ctx.stroke();
};

WTF.canvasY = 0;
WTF.canvasMaxY = 500;

WTF.race = {
    stage: "",
    numWinners: 0,
    playersFinished: 0,
    status: "",
    debugMode: true,

    stages: {
        opening: function() {
            WTF.race.showOpeningCeremony();
        },    
        heat1: function() {
            WTF.race.stageName = "Heat 1";
            WTF.race.numWinners = 2;
            WTF.race.setupNewRace();
            WTF.race.setupPlayers();
            WTF.race.showRace();
        },
        heat2: function() {
            WTF.race.stageName = "Heat 2";
            WTF.race.numWinners = 2;
            WTF.race.setupNewRace();
            WTF.race.setupPlayers();
            WTF.race.showRace();
        },
        finals: function() {
            WTF.race.stageName = "Finals";
            WTF.race.numWinners = 3;
            WTF.race.setupNewRace();
            WTF.race.setupPlayers();
            WTF.race.showRace();
        },
        podium: function() {
            WTF.race.podium.init();
        }
    },

    debug: function() {
        $(window).bind('keypress', function(e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if(code >= 49 && code <= 52) { 
                var player = code - 49;

                var i = 0;

                for(var userId in WTF.users) {
                    if(i++ == player) {
                        WTF.race.registerMove(userId, "left");
                    }
                }
            }
        });
    },

    registerMove: function(userId, foot) {
        if(WTF.users[userId].playing === true) {
            if (WTF.race.status !== "started"){
                return;
            }

            if(foot == 'left') {
                if(WTF.users[userId].image.src.indexOf('_2.png') >= 0) {
                    WTF.users[userId].image.src = WTF.users[userId].image.src.replace('_2.png', '.png');
                }
            }

            if(foot == 'right') {
                if(WTF.users[userId].image.src.indexOf('_2.png') < 0) {
                    WTF.users[userId].image.src = WTF.users[userId].image.src.replace('.png', '_2.png');
                }
            }      

            WTF.users[userId].x += WTF.steps;
        }
    },

    init: function() {
        WTF.race.showWaiting();
    },

    start: function() {
        WTF.competition = new Competition(WTF.numPlayers,WTF.users);
        if(WTF.race.debugMode === true) {
            WTF.race.debug();
        }
        WTF.race.nextStage();
    },

    nextStage: function() {
        WTF.race.playersFinished = 0;

        WTF.competition.nextStage();

        WTF.race.stage = WTF.competition.getCurrentStage();

        WTF.race.stages[WTF.race.stage]();
    },

    setupNewRace: function() {
        WTF.race.status = "starting";

        WTF.steps = 3,
        WTF.xStart = 10,
        WTF.yStart = 261,
        WTF.xOffset = 90,
        WTF.yOffset = 90,
        WTF.key1 = false,
        WTF.key2 = false,
        WTF.key3 = false,
        WTF.key4 = false,
        WTF.framenumber = 0,
        WTF.nextPosition = 1,
        WTF.countdown = 4;
    },

    setupPlayers: function() {
        var i = 0;

        WTF.users = WTF.competition.getRacers();

        for(var userId in WTF.users) {
            WTF.users[userId].x = WTF.xStart;
            WTF.users[userId].y = (WTF.yStart + (WTF.yOffset * i++));
            WTF.users[userId].image = new Image();
            WTF.users[userId].image.src = 'img/runner'+i+'.png';
            WTF.users[userId].photo = new Image();
            WTF.users[userId].photo.src = WTF.users[userId].photoSrc;
            WTF.users[userId].playing = true;
            WTF.users[userId].position = null;
            WTF.socket.emit('playerState', {
                'username': userId,
                'state': 'playing'
            });
        }

        console.log(WTF.users);
    },

    showWaiting: function() {
        if(WTF.remainingPlayers > 0) {

            WTF.clearCanvas();

            WTF.rect(0,0, WTF.width, WTF.height);


            WTF.ctx.drawImage(WTF.background, 0, 0);
            WTF.ctx.drawImage(WTF.qrImage, 330, 80, 300, 300);

            var xPos = 200,
                yMultiplier = 1;
                

            for(var userId in WTF.users) {
                if(yMultiplier > 4) {
                    yMultiplier = 1;
                    xPos = 720;
                }
                WTF.users[userId].photo = new Image();
                (function(uId,xPos,yMultiplier) {
                    WTF.users[userId].photo.onload = function() {
                        WTF.ctx.drawImage(WTF.users[uId].photo, xPos, (80 * yMultiplier), 50, 50);
                    };
                }(userId,xPos,yMultiplier++));
                WTF.users[userId].photo.src = WTF.users[userId].photoSrc;
            }

            WTF.ctx.font = "bold 36px sans-serif";
            WTF.ctx.textAlign = "center";
            WTF.ctx.fillStyle = "black";
            WTF.ctx.strokeStyle = "black";
            WTF.ctx.fillText("Waiting for "+WTF.remainingPlayers+ " players", (WTF.width /2), 450);
        } else {
            WTF.race.start();
        }
    },

    showOpeningCeremony: function() {
        if(WTF.canvasY <= WTF.canvasMaxY) {

            requestAnimationFrame(WTF.race.showOpeningCeremony);

            WTF.clearCanvas();

            WTF.rect(0,0, WTF.width, WTF.height);
            
            WTF.ctx.drawImage(WTF.background, 0, parseInt("-"+(++WTF.canvasY), 10));
        } else {
            WTF.race.nextStage();
        }
        
        var themeAudio = document.getElementById('audio');
        themeAudio.play();
        
    },

    showRace: function(){
        if(WTF.race.status.indexOf("start") >= 0) {
            requestAnimationFrame(WTF.race.showRace);

            WTF.clearCanvas();

            WTF.rect(0,0, WTF.width, WTF.height);
            
            WTF.ctx.drawImage(WTF.background, 0, -500);
                
            WTF.framenumber++;

            WTF.ctx.font = "bold 72px sans-serif";
            WTF.ctx.textAlign = "center";
            
            if (WTF.countdown === 4){
                WTF.ctx.fillText(WTF.race.stage.toUpperCase(), WTF.width / 2, 350);
            } else {

                if (WTF.countdown >= 1){
                    WTF.ctx.fillText(WTF.countdown, WTF.width / 2, 350);
                }

                if (WTF.countdown === 0){
                    WTF.ctx.fillText("GO", WTF.width / 2, 350);
                    WTF.race.status = "started";
                }
            }

            if (WTF.framenumber % 100 === 0 && WTF.countdown >= 0){
                WTF.countdown--;
            }

            for(var userId in WTF.users) {

                WTF.ctx.font = "bold 20px sans-serif";
                WTF.ctx.textAlign = "left";

                try {
                    var nameText = WTF.users[userId].name + (WTF.users[userId].position !== null ? " ("+WTF.users[userId].position+")":"");
                    WTF.ctx.fillText(nameText, 100, (WTF.users[userId].y + 55));
                    WTF.ctx.drawImage(WTF.users[userId].image, WTF.users[userId].x, WTF.users[userId].y);
                } catch(e) {
                    console.log(WTF.users);
                    console.log(userId);
                }
                
                if(WTF.users[userId].x >= 926 && WTF.users[userId].playing === true) {
                    WTF.race.playersFinished++;                
                    WTF.users[userId].playing = false;
                    WTF.users[userId].position = WTF.nextPosition;
                    WTF.socket.emit('playerFinished', {
                        'username': userId,
                        'position': WTF.nextPosition++
                    });

                    WTF.socket.emit('playerState', {
                        'username': userId,
                        'state': 'winner',
                        'position': '1st',
                        'stage': WTF.race.stage
                    });

                    WTF.competition.setWinner(userId,WTF.race.stage,WTF.users[userId].position);

                    if(WTF.race.playersFinished >= WTF.race.numWinners) {
                        for(var userId in WTF.users) {
                            if(WTF.users[userId].playing === true) {
                                WTF.socket.emit('playerState', {
                                    'username': userId,
                                    'state': 'gameover'
                                });
                            }
                        }
                        WTF.race.status = "finished";
                        WTF.ctx.font = "bold 72px sans-serif";
                        WTF.ctx.textAlign = "center";
                        WTF.ctx.fillText("END OF "+WTF.race.stage.toUpperCase(), WTF.width / 2, 350);
                        WTF.ctx.fillText("PLEASE WAIT", WTF.width / 2, 450);
                        window.setTimeout(WTF.race.nextStage, 5000);
                    }
                }
            }
        }
    },

    podium: {
        carpet: {},
        background: {},
        canvasY: 0,
        canvasMaxY: 362,
        podiumXY: [[425,260],[310,310],[540,340]],
        landingFx : {},

        init: function() {
        	
        	WTF.race.podium.audio = document.getElementById('audio');
        	
            WTF.users = WTF.competition.getRacers();

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
        }
        
    }
};
