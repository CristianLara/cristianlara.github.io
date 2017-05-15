
// pokemon available for spawn
var pokemonNames = ["charizard"];

// spawned pokemon
var createdPokemon = [];

/**
 * rand()
 * returns a random integer between min (inclusive) and max (inclusive)
 */
var rand = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * createPokemon()
 * instantiate a random pokemon from the list of
 * pokemon names. Remove the name from the list to not
 * have duplicates.
 */
var createPokemon = function() {
	if(pokemonNames.length) {
		createdPokemon.push(
			new Pokemon(
				pokemonNames.splice(rand(0, pokemonNames.length-1), 1)[0]
			)
		);
	}
};

/**
 * Pokemon
 * class for each instantiated pokemon
 */
function Pokemon(name) {

	this.sprite = null;    // reference to DOM sprite element
	this.name = name;	   // name of this pokemon
	this.posX = 600;       // X position in pixels
	this.posY = -64;       // Y position in pixels
	this.step = 0;         // current step number in cycle
	this.stepSize = 8;     // distance in pixels of each step
	this.stepsInCycle = 2; // number of steps before resetting
	this.animStep = 0;	   // step in the animation
	this.walking = false;  // timer for the walking animation
	this.direction = null; // direction sprite is facing

	// keycode constants
	this.directionText = Object.freeze({
		37:"left", 38:"up", 39:"right", 40:"down"
	});
	this.keycode = Object.freeze({
		LEFT: 37, UP: 38, RIGHT: 39, DOWN:40
	});

	// add pokemon to DOM
	$("#title").before(
		"<img id=\"" + name + "\" "
		+    "class=\"" + name + "\" "
		+    "src=\"img/pokemon/" + name + "/left0.png\">"
	);


	this.sprite = $("#" + name)[0];
	this.animateIn();

}

/**
 * animateIn()
 * animate the pokemon into view from a random location
 */
Pokemon.prototype.animateIn = function() {
	var top  = window.pageYOffset || document.documentElement.scrollTop;
    var left = window.pageXOffset || document.documentElement.scrollLeft;
    var height = $(window).height();
    var width = window.innerWidth;

    this.posY = rand(top, top + height -
    	this.sprite.getBoundingClientRect().height);

    if(/*rand(0,1)*/1) {
    	// animate from right
    	this.posX = width;
    	this.direction = this.keycode.LEFT;
    } else {
    	// animate from left
    	this.posX = 0 - this.sprite.getBoundingClientRect().width;
    	this.direction = this.keycode.RIGHT;
    }

    this.sprite.style.left =this.posX +'px';
	this.sprite.style.top = this.posY +'px';

	var targetX = rand(0, width - this.sprite.style.width);
	this.walkIn(targetX);
}

Pokemon.prototype.walkIn = function(target) {
	if(this.direction == this.keycode.LEFT) {
		if(this.posX > target) {
			// haven't reached the target yet
			this.animStep = (this.animStep + 1) % 2;
			this.sprite.src = "img/pokemon/" + this.name + "/"
							   +  this.directionText[this.direction]
							   +  this.animStep % 2 + ".png";
			this.posX -= this.stepSize;
			this.sprite.style.left =this.posX + 'px';

			setTimeout(function(target, ref) {
				ref.walkIn(target); 
			}, 60, target, this);
		} else {
			// reached target, stop walking in
			this.startAnimating();
		}
	} else {
		if(this.posX > target) {
			this.startAnimating();
		} {

		}
	}
}

/**
 * takeStep()
 * change direction and location of sprite
 */
Pokemon.prototype.takeStep = function() {
	this.direction = rand(37,40);
	this.walking = true;
};

/**
 * animate()
 * auto walking animation cycling through the sprite in the
 * current direction
 */
Pokemon.prototype.animate = function() {
	if(this.walking) {
		this.step = (this.step + 1) % 2;
		switch(this.direction) {
		    case this.keycode.RIGHT:
		        this.posX += this.stepSize;
		        break;

		    case this.keycode.LEFT:
		        this.posX -= this.stepSize;
		        break;

		    case this.keycode.DOWN:
		        this.posY += this.stepSize;
	        	break;

		    case this.keycode.UP:
		        this.posY -= this.stepSize;
		        break;

		    default: break;
		}

	  document.getElementById(this.name).style.left =this.posX + 'px';
	  document.getElementById(this.name).style.top = this.posY + 'px';

	  if(this.step == 0) {
	  	this.walking = false;
	  	setTimeout(function(ref) { ref.takeStep(); }, rand(1000,3000), this);
	  }
	}

	this.animStep = (this.animStep + 1) % 2;
	this.sprite.src = "img/pokemon/" + this.name + "/"
					   +  this.directionText[this.direction]
					   +  this.animStep % 2 + ".png";
};

/**
 * stopWalking()
 * pause the walking animation timer
 */
Pokemon.prototype.stopWalking = function() {
  clearInterval(this.walker);
};

/**
 * startAnimating()
 * begin cycling timer for walking animation
 */
Pokemon.prototype.startAnimating = function() {
	this.direction = this.keycode.LEFT;
	setInterval(function(ref) { ref.animate(); }, 300, this);
  	setTimeout(function(ref) { ref.takeStep(); }, rand(1000,2000), this);
};