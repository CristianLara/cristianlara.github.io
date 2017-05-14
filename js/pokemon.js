
var Charizard = {

	// reference to DOM sprite element
	sprite:null,

	posX:600,       // X position in pixels
	posY:-64,       // Y position in pixels
	step:0,         // current step number in cycle
	stepSize:5,     // distance in pixels of each step
	stepsInCycle:2, // number of steps before resetting
	walker:null,    // timer for the walking animation
	direction:null, // direction sprite is facing

	// keycode constants
	directionText:Object.freeze({37:"left", 38:"up", 39:"right", 40:"down"}),
	keycode:Object.freeze({LEFT: 37, UP: 38, RIGHT: 39, DOWN:40}),

	init:function() {
		var elem = "<img id=\"charizard\" class=\"charizard\" src=\"img/pokemon/charizard/left0.png\">";
		$("#sprite").before(elem);
		Charizard.sprite = document.getElementById("charizard");
		Charizard.startWalking();
	},

	/**
	* takeStep()
	* change direction and location of sprite
	*/
	takeStep:function() {
		console.log("step: " + Charizard.step);
		console.log("direction: " + Charizard.direction);
	  Charizard.step = (Charizard.step + 1) % 4;

	  switch(Charizard.direction) {
	     case Charizard.keycode.RIGHT:
	        Charizard.posX += Charizard.stepSize;
	        break;

	     case Charizard.keycode.LEFT:
	        Charizard.posX -= Charizard.stepSize;
	        break;

	     case Charizard.keycode.DOWN:
	        Charizard.posY += Charizard.stepSize;
	        break;

	     case Charizard.keycode.UP:
	        Charizard.posY -= Charizard.stepSize;
	        break;

	     default: break;
	  }

	  document.getElementById("charizard").style.left = Charizard.posX + 'px';
	  document.getElementById("charizard").style.top = Charizard.posY + 'px';
	  Charizard.sprite.src = "img/pokemon/charizard/" + Charizard.directionText[Charizard.direction] + Charizard.step % 2 + ".png";	  

	  if(Charizard.step != 0) {
	  	setTimeout(function() { Charizard.takeStep(); }, 100);
	  } else {
	  	Charizard.direction = Charizard.rand(37,40);
	  	setTimeout(function() { Charizard.takeStep(); }, 1500);
	  	// setTimeout(function() { Charizard.takeStep(); }, Charizard.rand(500, 2000))
	  }
	},

	/**
	* startWalking()
	* begin cycling timer for walking animation
	*/
	startWalking:function() {
		Charizard.direction = Charizard.rand(37,40);
		Charizard.takeStep();
	  	// Charizard.walker = setTimeout(function() { Charizard.takeStep(); }, Charizard.rand(500, 2000));
	},

	/**
	* walk()
	* auto walking animation cycling through the sprite in the current direction
	*/
	walk:function() {
	  Charizard.direction = Charizard.rand(37,40);
	  Charizard.takeStep();
	  setTimeout("Charizard.walk();", Charizard.rand(500, 2000));
	},

	/**
	 * Returns a random integer between min (inclusive) and max (inclusive)
	 * Using Math.round() will give you a non-uniform distribution!
	 */
	rand:function(min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	/**
	* stopWalking()
	* pause the walking animation timer
	*/
	stopWalking:function() {
	  clearInterval(Charizard.walker);
	}
}
