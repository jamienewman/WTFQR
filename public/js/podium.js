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
	canvasMaxY : 500,
	width : 960,
    height : 1100,
	
	init : function () {
		Podium.doc = document;
		Podium.canvas = Podium.doc.getElementById('podium');
		Podium.ctx = Podium.canvas.getContext('2d');
		
		function canvasSupport() {
			return !!document.createElement('canvas').getContext;
		}

		function eventWindowLoaded() {

			if (!canvasSupport) {
				return;
			}

			Podium.renderBg();
		}
		
		window.addEventListener('load', eventWindowLoaded, false);
	},
	
	renderBg : function () {
		Podium.background = new Image();
		Podium.background.onload = function () {
			Podium.ctx.drawImage(Podium.background, 0, 0);
			Podium.animateBg();
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
	
	animateBg : function () {
		if (Podium.canvasY <= Podium.canvasMaxY) {
          requestAnimationFrame(Podium.animateBg);
          Podium.clearCanvas();
          Podium.rect(0, 0, Podium.width, Podium.height);
          Podium.ctx.drawImage(Podium.background, 0, parseInt("-" + (++Podium.canvasY), 10));
		} else {
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
			Podium.ctx.drawImage(Podium.second, 310, 290);
		};
		Podium.second.src = "/img/balotelli.jpg";
		
		Podium.first = new Image();
		Podium.first.onload = function () {
			Podium.ctx.drawImage(Podium.first, 430, 230);
		};
		Podium.first.src = "/img/balotelli.jpg";
	}
	
};

Podium.init();