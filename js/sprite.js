
var Sprite = {

   // reference to DOM sprite element
   sprite: document.getElementById("sprite"),
   container: document.getElementsByClassName('spriteContainer')[0],
   tip: document.getElementById("tip"),

   posX: 465,       // X position in pixels
   posY: -64,       // Y position in pixels
   step: 0,         // current step number in cycle
   stepSize: 4,     // distance in pixels of each step
   stepsInCycle: 9, // number of steps before resetting
   walker: null,    // timer for the walking animation
   direction: null, // direction sprite is facing

   // keycode constants
   directionText: Object.freeze({ 37: "left", 38: "up", 39: "right", 40: "down" }),
   keycode: Object.freeze({ LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 }),

   // tips with their associated delays
   currentTip: 0,
   orderedTips: [
      { content: 'skip with \'space\'', delay: 2000, duration: 3000 },
      { content: 'try your arrow keys!', delay: 10000, duration: 3000 }
   ],

   init: function () {
      $(window).on('load', function () {
         Sprite.sprite = document.getElementById("sprite");
         Sprite.container = document.getElementsByClassName('spriteContainer')[0];

         // keyboard listener for sprite control
         document.addEventListener("keydown", function (event) {
            if (event.which >= Sprite.keycode.LEFT && event.which <= Sprite.keycode.DOWN) {
               event.preventDefault(); // prevent arrow keys from scrolling
               Sprite.direction = event.which;
               Sprite.takeStep();
            }
         });

         Sprite.sprite.addEventListener("mousedown", function (event) {
            Sprite.showTip('Hello!', 1000);
         });

         Sprite.tip = document.getElementById('tip');
         Sprite.cycleTips();
         Sprite.cacheImages();
      });
      Sprite.direction = Sprite.keycode.RIGHT;
   },

   cacheImages: function () {
      var images = new Array();
      function preload() {
         for (i = 0; i < preload.arguments.length; i++) {
            images[i] = new Image()
            images[i].src = preload.arguments[i]
         }
      };
      preload(
         "img/me/down0.png",
         "img/me/down1.png",
         "img/me/down2.png",
         "img/me/down3.png",
         "img/me/down4.png",
         "img/me/down5.png",
         "img/me/down6.png",
         "img/me/down7.png",
         "img/me/down8.png",
         "img/me/left0.png",
         "img/me/left1.png",
         "img/me/left2.png",
         "img/me/left3.png",
         "img/me/left4.png",
         "img/me/left5.png",
         "img/me/left6.png",
         "img/me/left7.png",
         "img/me/left8.png",
         "img/me/up0.png",
         "img/me/up1.png",
         "img/me/up2.png",
         "img/me/up3.png",
         "img/me/up4.png",
         "img/me/up5.png",
         "img/me/up6.png",
         "img/me/up7.png",
         "img/me/up8.png",
         "img/me/right0.png",
         "img/me/right1.png",
         "img/me/right2.png",
         "img/me/right3.png",
         "img/me/right4.png",
         "img/me/right5.png",
         "img/me/right6.png",
         "img/me/right7.png",
         "img/me/right8.png"
      );
   },

   /**
    * cycleTips()
    * shows tip after 'onDelay' ms for 'offDelay' ms
    */
   cycleTips: function (content) {
      if (Sprite.currentTip >= Sprite.orderedTips.length) return;
      const tip = Sprite.orderedTips[Sprite.currentTip];
      Sprite.writeTip(tip.content);

      // create delay for tip
      setTimeout(function () {
         $('#tip').fadeTo(500, 1, function () {
            // once faded in, delay for fade out
            setTimeout(function () {
               $('#tip').fadeTo(800, 0, function () {
                  // once faded out, delay for next tip
                  Sprite.currentTip++;
                  Sprite.cycleTips();
               });
            }, tip.duration);
         });
      }, tip.delay);
   },

   /**
    * writeTip()
    * helper function to generate formatted tip text
    */
   writeTip: function (content) {
      let widthFill = ''
      for (i = 0; i < content.length; i++) {
         widthFill += '-'
      }
      $("#tip").html(
`+-${widthFill}-+
| ${content} |
+-${widthFill}-+`
      );
   },

   /**
    * showTip()
    * immediately shows tip with 'content' for 'duration' ms
    */
   showTip: function (content, duration) {
      Sprite.writeTip(content);
      $('#tip').fadeTo(400, 1, function () {
         setTimeout(function () {
            $('#tip').fadeTo(800, 0);
         }, duration);
      });
   },

   /**
    * takeStep()
    * change direction and location of sprite
    */
   takeStep: function () {
      Sprite.step = (Sprite.step + 1) % Sprite.stepsInCycle;

      switch (Sprite.direction) {
         case Sprite.keycode.RIGHT:
            Sprite.posX += Sprite.stepSize;
            break;

         case Sprite.keycode.LEFT:
            Sprite.posX -= Sprite.stepSize;
            break;

         case Sprite.keycode.DOWN:
            Sprite.posY += Sprite.stepSize;
            break;

         case Sprite.keycode.UP:
            Sprite.posY -= Sprite.stepSize;
            break;

         default: break;
      }

      if (Sprite.sprite.getBoundingClientRect().top > $(window).height()) {
         Sprite.posY -= $(window).height();
      }
      if (Sprite.sprite.getBoundingClientRect().left > $(window).width()) {
         Sprite.posX -= $(window).width();
      }
      if (Sprite.sprite.getBoundingClientRect().top < 0) {
         Sprite.posY += $(window).height();
      }
      if (Sprite.sprite.getBoundingClientRect().left < 0) {
         Sprite.posX += $(window).width();
      }

      Sprite.container.style.left = Sprite.posX + 'px';
      Sprite.container.style.top = Sprite.posY + 'px';
      const spriteName = Sprite.directionText[Sprite.direction] + Sprite.step;
      Sprite.sprite.src = "img/me/" + spriteName + ".png";
      if (Sprite.step != 0) setTimeout(function () { Sprite.takeStep(); }, 60);
   },

   /**
    * startWalking()
    * begin cycling timer for walking animation
    */
   startWalking: function () {
      Sprite.walker = setInterval("Sprite.walk();", 100);
   },

   /**
    * walk()
    * auto walking animation cycling through the sprite in the current direction
    */
   walk: function () {
      Sprite.step = (Sprite.step + 1) % Sprite.stepsInCycle;
      const spriteName = Sprite.directionText[Sprite.direction] + Sprite.step;
      Sprite.sprite.src = "img/me/" + spriteName + ".png";
   },

   /**
    * stopWalking()
    * pause the walking animation timer
    */
   stopWalking: function () {
      clearInterval(Sprite.walker);
   }
}

Sprite.init();
