var log = function (m) {
	try {
		console.log(m);
	} catch (ex) {
		return;
	}
};

window.requestAnimationFrame = (function () {
	return window.requestAnimationFrame  ||    
			window.webkitRequestAnimationFrame ||    
			window.mozRequestAnimationFrame ||    
			window.oRequestAnimationFrame  ||    
			window.msRequestAnimationFrame  ||    
			function(callback, element) {   
				window.setTimeout(callback, 1000 / 60);   
			};   
}());


var Podium = (function () {
	
	var doc     = document,
		canvas  = doc.getElementById('podium'),
		ctx     = canvas.getContext('2d');
	
	// only draw when image has loaded
//	var render = function () {
//
//		// set background stuff
//		var bgReady = false;
//		var bgImage = new Image();
//		bgImage.onload = function () {
//			bgReady = true;
//		};
//		bgImage.src = "/img/podium.png";
//		
//		if (bgReady) {
//			ctx.drawImage(bgImage, 0, 0);
//		} else {
//			log("background not loaded!");
//		}
//		
//	};
	
	var drawPodium = function () {
		ctx.font = "90px Arial";
		ctx.fillText("1", 625, 450);
		ctx.fillText("2", 425, 560);
		ctx.fillText("3", 825, 580);
		
		ctx.strokeRect(350, 450, 200, 150);
		ctx.strokeRect(550, 350, 200, 250);
		ctx.strokeRect(750, 500, 200, 100);
		
	};
	
	var drawImages = function () {
		
		ctx.font = "18px Arial";
		// 1st place
		var firstReady = false;
		var firstImage = new Image();
		firstImage.onload = function () {
			ctx.drawImage(firstImage, 580, 100);
		};
		firstImage.src = "/img/balotelli.jpg";
		ctx.fillText("Balotelli 1", 620, 50);

		// 2nd place
		var secondReady = false;
		var secondImage = new Image();
		secondImage.onload = function () {
			ctx.drawImage(secondImage, 375, 200);
		};
		secondImage.src = "/img/balotelli.jpg";
		ctx.fillText("Balotelli 2", 410, 150);

		// 3rd place
		var thirdReady = false;
		var thirdImage = new Image();
		thirdImage.onload = function () {
			ctx.drawImage(thirdImage, 780, 250);
		};
		thirdImage.src = "/img/balotelli.jpg";
		ctx.fillText("Balotelli 3", 815, 200);
		
	};
	
	var animate = function () {
		log("animate");
	};
	
	return {
		
		init : function () {
			
			function canvasSupport() {
				return !!document.createElement('canvas').getContext;
			}

			function eventWindowLoaded() {

				if (!canvasSupport) {
					return;
				}

//				render();
				drawPodium();
				drawImages();
				animate();
			}
			
			window.addEventListener('load', eventWindowLoaded, false);
			
		}
	
	};

}());

Podium.init();