var log = function (m) {
	try {
		console.log(m);
	} catch (ex) {
		return;
	}
};

var Podium = {
		
	doc : null,
	canvas : null,
	ctx : null,
	canvasY : 0,
	canvasMaxY : 362,
	width : 960,
    height : 600,
	
	init : function () {
		Podium.doc = document;
		Podium.canvas = Podium.doc.getElementById('podium');
		Podium.ctx = Podium.canvas.getContext('2d');
		Podium.ctx.save();
		Podium.audio = document.getElementById('audio');
		
		function canvasSupport() {
			return !!document.createElement('canvas').getContext;
		}

		function eventWindowLoaded() {

			if (!canvasSupport) {
				return;
			}

			Podium.render();
		}
		
		window.addEventListener('load', eventWindowLoaded, false);
	},
	
	render : function () {
		
		Podium.audio.src= "/audio/cartoonbombdrop.wav";
		Podium.audio.play();
		
		Podium.carpet = new Image();
		Podium.carpet.onload = function () {
			Podium.ctx.drawImage(Podium.carpet, 0, 400);
		};
		Podium.carpet.src = '/img/red-carpet.png';
		Podium.background = new Image();
		Podium.background.onload = function () {
			Podium.ctx.drawImage(Podium.background, 300, 0);
			Podium.animate();
		};
		Podium.background.src = '/img/podium.png';
		
	},
	
	clearCanvas : function () {
		Podium.ctx.clearRect(0, 0, Podium.width, Podium.height);
	},
	
	rect : function (x, y, w, h) {
		Podium.ctx.beginPath();
		Podium.ctx.rect(x ,y, w, h);
		Podium.ctx.closePath();
		Podium.ctx.fill();
		Podium.ctx.stroke();
	},
	
	animate : function () {
		
		
		if (Podium.canvasY <= Podium.canvasMaxY) {
			Podium.ctx.rotate(0);
			requestAnimationFrame(Podium.animate);
			Podium.clearCanvas();
			Podium.ctx.drawImage(Podium.carpet, 0, 480);
			Podium.canvasY = Podium.canvasY + 7;
			if (Podium.canvasY >= 360) {
				Podium.ctx.translate(-100, 140);
				Podium.ctx.rotate(-0.23);
			}
			Podium.ctx.drawImage(Podium.background, 300, parseInt(Podium.canvasY, 10));
		} else {
			Podium.audio.pause();
			Podium.audio.src="/audio/ball_bounce.wav";
			Podium.audio.play();
			Podium.ctx.restore();
			Podium.drawImages();
		}
	},
	
	drawImages : function () {
		Podium.third = new Image();
		Podium.third.onload = function () {
			Podium.ctx.drawImage(Podium.third, 545, 310);
		};
		Podium.third.src = "/img/balotelli.jpg";
		
		Podium.second = new Image();
		Podium.second.onload = function () {
			Podium.ctx.drawImage(Podium.second, 310, 280);
		};
		Podium.second.src = "/img/balotelli.jpg";
		
		Podium.first = new Image();
		Podium.first.onload = function () {
			Podium.ctx.drawImage(Podium.first, 430, 230);
		};
		Podium.first.src = "/img/balotelli.jpg";
		
		Podium.playApplause();
		
	},
	
	playApplause : function () {
		Podium.audio.addEventListener("ended", function() {
			Podium.audio.src = "/audio/applause-8.wav";
		    Podium.audio.play();
		    Podium.audio.addEventListener("ended", function() {
		    	Podium.audio.pause();
		    });
		});
	}
	
};

Podium.init();