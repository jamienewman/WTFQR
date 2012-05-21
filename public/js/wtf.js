/**
 * 
 * 
 * 
 * 
 * 
 */

var WTF = WTF || {};


WTF.socket = io.connect('http://localhost');

    
WTF.socket.on('news', function (data) {
    console.log(data);
    WTF.socket.emit('my other event', { my: 'data' });
});


WTF.game = function(){


	var canvas,  
		ctx,
		steps = 10,
		r1x = 10,
		r1y = 80,
		r2x = 10,
		r2y = 170,
		width = 600,
		height = 241,
		background = new Image(),
		runner1 = new Image(),
		runner2 = new Image(),
		finished = false,
		key1 = false,
		key2 = false,
		key3 = false,
		key4 = false,
		timer = setTimeout(onTimeout, 4000),
		framenumber = 0,
		countdown = 4;


	var player1name = prompt('Player 1 - Enter your name');
	var player2name = prompt('Player 2 - Enter your name');


	background.src = 'img/bg.gif';
	runner1.src = 'img/runner1.png'
	runner2.src = 'img/runner2.png'


	function init() {
		canvas = document.getElementById("canvas");
		ctx = canvas.getContext("2d");
		animate();
		//return setInterval(draw, 10);
	}

	function animate(){
		requestAnimationFrame(animate);
		draw();
	}

	if(window.G_vmlCanvasManager){
		document.getElementById('canvas');
		ctc = canvas.getContext(canvas);
	}

	function rect(x,y,w,h) {
		ctx.beginPath();
		ctx.rect(x,y,w,h);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}

	function clearCanvas() {
		ctx.clearRect(0, 0, width, height);
	}

	function doKeyDown(evt){	
		if (finished){
			return
		}
		if (evt.keyCode === 90) {
			runner1.src = 'img/runner1.png';
			if(key1){
				key1 = key2 = false;
			}
			key1 = true;
		}
		if (evt.keyCode === 88) {
			runner1.src = 'img/runner1_2.png';
			key2 = true;
		}
		if(key1 && key2){
			//move the guy
			if (r1x + steps < width) {
				r1x += steps; 
			}
			key1 = key2 = false;
		}
		if (evt.keyCode === 78) {
			runner2.src = 'img/runner2.png';
			if(key3){
				key3 = key4 = false;
			}
			key3 = true;
		}
		if (evt.keyCode === 77) {
			runner2.src = 'img/runner2_2.png';
			key4 = true;
		}
		if(key3 && key4){
			//move the guy
			if (r2x + steps < width) {
				r2x += steps; 
			}
			key3 = key4 = false;
		}
	}

	function names() {
		ctx.font = "bold 20px sans-serif";
		ctx.fillText(player1name, 35, 135);
		ctx.font = "bold 20px sans-serif";
		ctx.fillText(player2name, 35, 225);
	}


	function draw() {
		clearCanvas();
		rect(0,0,width,height);
		ctx.drawImage(background,0,0);
		names();
		framenumber++;
		if (framenumber%100 === 0 && countdown){
			countdown--;
		}
		if (countdown >= 2){
			ctx.font = "bold 40px sans-serif";
			ctx.fillText(countdown-1, width / 2, 50);
			ctx.textAlign = "center";
		}
		if (countdown === 1){
			ctx.font = "bold 40px sans-serif";
			ctx.fillText("GO", width / 2, 50);
			ctx.textAlign = "center";
		}
		ctx.drawImage(runner1,r1x,r1y);
		ctx.drawImage(runner2,r2x,r2y);
		if (r1x >= 566) {
			finished = true;
			document.getElementById('audio1').pause();
			ctx.clearRect(0, 0, width, height);
			rect(0,0,width,height);
			ctx.drawImage(background,0,0);
			ctx.drawImage(runner1,r1x,r1y);
			ctx.drawImage(runner2,r2x,r2y);
			ctx.font = "bold 20px sans-serif";
			ctx.fillText("The Winner is " + player1name, width / 2, 135);
			ctx.textAlign = "center";
		}
		if (r2x >= 566) {
			finished = true;
			document.getElementById('audio1').pause();
			ctx.clearRect(0, 0, width, height);
			rect(0,0,width,height);
			ctx.drawImage(background,0,0);
			ctx.drawImage(runner1,r1x,r1y);
			ctx.drawImage(runner2,r2x,r2y);
			ctx.font = "bold 20px sans-serif";
			ctx.fillText("The Winner is " + player2name, width / 2, 135);
			ctx.textAlign = "center";
		}
	}

	/* Initilisation
	---------------------------------------*/

	// window.focus();

	// document.getElementById('audio1').play();

	init();

	function onTimeout() {
		window.addEventListener('keydown',doKeyDown,true);
	}

	// document.getElementById('audio1').addEventListener('ended', function(){
	//	this.currentTime = 0;
	// }, false);	

};


(function() {
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


WTF.game();
