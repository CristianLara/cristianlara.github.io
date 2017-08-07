
var Terminal = {

   userName:"",
   text:"",              // to contain the content of the text file
   index:0,              // current cursor position in the text to add
   speed:1,              // number of letters to add at a time
   file:"",              // name of text file to get text from
   pending:"",           // pending string of text to type
   insertingHtml:false,  // indicates if we're inserting text between html tags
   contentOffset:0,      // the offset in the content compared to the textfile
   pauseDuration:500,    // duration of pause action in milliseconds
   htmlIndicator:"<",    // character indicating that we have encountered html
   acceptingInput:false, // indicating if accepting user input
   input:"",             // input text from user
   shownEmail:false,     // if I've shown my address, compose an email
   skip:false,           // controls skipping typing animation

   // keycode constants
   keycode:Object.freeze({ENTER: 13, BACKSPACE: 8, SPACE: 32}),

   // these characters are interpreted as special actions when read
   // i.e. linebreak, pause, clear, preformatted message
   specialCharacters:["\n", "\\", "`", "$"],

   /**
    * init()
    * Starts cursor blinking, reads textfile and stores in Terminal.text
    * Adds click events to action links
    */
   init:function() {
      setInterval(function(){Terminal.blink();},500); // start cursor blink

      $.get(Terminal.file,function(data){
         Terminal.text = data; // save the textfile in Terminal.text
      });

      Terminal.addInputListener();

      //add click actions for links before they're even added
      $(window).on('load', function() {
         $("#console").on('click', "#one", function() {
            Terminal.clearInput();
            Terminal.write('\n');
            Terminal.acceptingInput = false;
            Terminal.printResume();
         });
         // createAllPokemon();
      });
   },

   /**
    * startTyping()
    * begins the Terminal's process of automatically typing text
    */
   startTyping:function() {
      Terminal.typer = setInterval(function() {Terminal.type();}, 1);
   },

   /**
    * type()
    * repeating function which keeps adding text as long as there
    * is text left to type
    */
   type:function() {
      Terminal.addText();
      if (Terminal.index > Terminal.text.length) {
         Terminal.stopTyping();
      }

      if(Terminal.skip) {
         Terminal.stopTyping();
         while(Terminal.index <= Terminal.text.length) {
            Terminal.addText();
         }
         Terminal.skip = false;
      }
   },

   /**
    * stopTyping()
    * pause the Terminal's typing
    */
   stopTyping:function() {
      clearInterval(Terminal.typer);
   },

   /**
    * content()
    * returns the content in the terminal
    */
   content:function() {
      return $("#text").html();
   },

   /**
    * write(str)
    * appends str to the end of the terminal
    */
   write:function(str) {
      Terminal.removeCursor();
      // $("#console").append(str);
      $("#text").append(str);
      return false;
   },

   /**
    * insert(str)
    * inserts strings into the current place of the cursor
    * this is primarily used for inserting text between html tags
    */
   insert:function(str) {
      Terminal.removeCursor();
      var content = Terminal.content();
      var contentBefore =
         content.substring(0, Terminal.index + Terminal.contentOffset - 1);
      var contentAfter =
         content.substring(Terminal.index + Terminal.contentOffset - 1);

      $("#text").html(contentBefore + str + contentAfter);
   },

   /**
    * clear()
    * clears the terminal of all text and html
    */
   clear:function() {
      $("#text").html("");
   },


   /**
    * addInputListener()
    * adds keyboard listener to allow input to the terminal
    * also adds listener to allow for control of the sprite
    */
   addInputListener:function() {
      // keyboard listener for terminal input
      document.addEventListener("keydown", function(event) {
            if(Terminal.acceptingInput) {
               character = String.fromCharCode(event.which).toLowerCase();

               // User hit enter
               if (event.which == Terminal.keycode.ENTER) {
                  event.preventDefault();
                  Terminal.acceptingInput = false;
                  Terminal.contentOffset--;
                  if (Terminal.input == "1") {
                     Terminal.input = "";
                     Terminal.printResume();
                  }
                  else if (Terminal.input == "2") {
                     Terminal.showMessage(2);
                     Terminal.downloadResume();
                  }
                  else if (Terminal.input == "3") {
                     Terminal.showMessage(3);
                     if(Terminal.shownEmail) {
                        Terminal.emailMe();
                     } else {
                        Terminal.shownEmail = true;
                     }
                  }
                  else if (Terminal.input == "pokemon") {
                     Terminal.showMessage(4);
                     createAllPokemon();
                  }
                  else {
                     Terminal.showMessage(-1);
                  }
               }

               // User hit backspace
               else if (event.which == Terminal.keycode.BACKSPACE) {
                  event.preventDefault();
                  if(Terminal.input.length > 0) {
                     Terminal.removeCursor();
                     Terminal.removeLastCharacter();
                     Terminal.contentOffset--;
                     length = Terminal.input.length;
                     Terminal.input = Terminal.input.substring(0, length - 1);
                  }
               }

               // User hit an alpha-numeric key
               else if ((character >= 0 && character <= 9) ||
                        (character >= 'a' && character <= 'z')) {
                  Terminal.removeCursor();
                  Terminal.write(character);
                  Terminal.input += character;
                  Terminal.contentOffset++;
               }
            }
            // skip animation
            else {
               if(event.which == Terminal.keycode.SPACE) {
                  Terminal.skip = true;
               }
            }
      });
   },

   clearInput:function() {
      Terminal.offset -= Terminal.input.length;
      Terminal.input = "";
   },

   showMessage:function(code) {
      Terminal.text += " \n";
      switch(code) {
         // download resume
         case 2:
            Terminal.text += "downloading resume...";
            break;

         // contact me
         case 3:
            if(Terminal.shownEmail) {
               Terminal.text += "attempting to launch your email client...";
            } else {
               Terminal.text += "you can contact me at "
                             +  "cristianlara@stanford.edu\n"
                             +  "<span class=\"c\">tip</span>: "
                             +  "enter 3 again to auto compose an email to me "
                             +  "via your default email client";
            }
            break;

         // pokemon
         case 4:
            Terminal.text += "initiating pokemon...";
            break;

         // error code
         case (-1):
            Terminal.text += "<span class=\"error\">"
                          +  "enter number between 1 and 3...</span>";
            break;

         default:
            break;
      }
      Terminal.text += "\n\n$"
      Terminal.startTyping();
      Terminal.clearInput();
   },

   downloadResume:function() {
      document.getElementById("two").click();
   },

   emailMe:function() {
      document.getElementById("three").click();
   },

   /**
    * handleSpecialCharacter(char)
    * handle special characters with the following actions
    *
    * \n : insert <br> tag
    * $  : insert terminal prompt
    * `  : pause before typing more
    * \  : clear terminal
    */
   handleSpecialCharacter:function(char) {
      if(char.includes("\n")) {
         Terminal.insert("<br>");
         Terminal.contentOffset += "<br>".length - "\n".length;
      }
      else if(char.includes("$")) {
         var prompt = "<span class=\"a\">root@" +Terminal.userName +"</span>:"+
                      "<span class=\"b\">~</span>" +
                      "<span class=\"c\">$</span> ";
         Terminal.insert(prompt);
         Terminal.contentOffset += prompt.length - "~".length;
         if(Terminal.index > 3) Terminal.acceptingInput = true;
      }
      else if(char.includes("`")) {
         Terminal.contentOffset -= "`".length;
         if(!Terminal.skip) {
            Terminal.stopTyping();
            setTimeout(Terminal.startTyping, Terminal.pauseDuration);
         }
      }
      else if(char.includes("\\")) {
         Terminal.clear();
         Terminal.contentOffset = -Terminal.index;
      }
   },

   /**
    * handleHtml()
    * Adds encountered html tags to the content, then offsets index to add
    * next characters between the tags until the end tag is reached.
    */
   handleHtml:function() {
      if(Terminal.insertingHtml) {
         Terminal.insertingHtml = false;

         var endOfCloseTag = Terminal.text.indexOf(">", Terminal.index);
         var closeTag = Terminal.text.substring(Terminal.index, endOfCloseTag);

         Terminal.index += closeTag.length + 1;
      } else {
         Terminal.insertingHtml = true;

         var endOfOpenTag = Terminal.text.indexOf(">", Terminal.index);
         var startOfCloseTag = Terminal.text.indexOf("<", endOfOpenTag);
         var endOfCloseTag = Terminal.text.indexOf(">", startOfCloseTag);

         var openTag=Terminal.text.substring(Terminal.index-1,endOfOpenTag+1);
         var closeTag=Terminal.text.substring(startOfCloseTag,endOfCloseTag+1);

         Terminal.insert(openTag + closeTag);

         Terminal.index += openTag.length - 1;
      }
   },

   /**
    * addText()
    * Goes through the text file typing it out into the Terminal one letter at a time.
    * Recognizes html and adds the tags before typing out the inner content.
    */
   addText:function() {
      if(!Terminal.text) return;
      Terminal.removeCursor();

      Terminal.index += Terminal.speed;
      Terminal.pending = Terminal.text.charAt(Terminal.index - 1);

      // if the next character indicates an action
      if(Terminal.specialCharacters.includes(Terminal.pending)) {
         Terminal.handleSpecialCharacter(Terminal.pending);
      }
      // if the next character is an html tag
      else if(Terminal.pending == (Terminal.htmlIndicator)) {
         Terminal.handleHtml();
      }
      // it's just a normal character to insert
      else {
         Terminal.insert(Terminal.pending);
      }

      window.scrollBy(0,50); // scroll to make sure bottom is always visible

   },

   printResume:function() {
      $.get(Terminal.resume,function(resumeData){
         Terminal.text += resumeData;
         Terminal.startTyping();
      });
   },

   /**
    * removeLastCharacter()
    * removes the last character in the Terminal's content
    */
   removeLastCharacter:function() {
        var content = Terminal.content();
        $("#text").html(content.substring(0, content.length - 1));
   },

   /**
    * cursorIsOn()
    * returns true if the cursor is being displayed, false otehrwise
    */
   cursorIsOn:function() {
      var content = $("#cursor").html();
      return content == "|";
   },

   /**
    * removeCursor()
    * removes the cursor if it is currently being displayed
    */
   removeCursor:function(){
      if(Terminal.cursorIsOn())
         $("#cursor").html("");
   },

   /**
    * blink()
    * blink the cursor by removing and reading it
    */
   blink:function(){
      var content = Terminal.content();
      if(Terminal.cursorIsOn())
         $("#cursor").html("");
      else
         $("#cursor").html("|");
   }
}

var Sprite = {

   // reference to DOM sprite element
   sprite:document.getElementById("sprite"),

   posX:465,       // X position in pixels
   posY:-64,       // Y position in pixels
   step:0,         // current step number in cycle
   stepSize:4,     // distance in pixels of each step
   stepsInCycle:9, // number of steps before resetting
   walker:null,    // timer for the walking animation
   direction:null, // direction sprite is facing

   // keycode constants
   directionText:Object.freeze({37:"left", 38:"up", 39:"right", 40:"down"}),
   keycode:Object.freeze({LEFT: 37, UP: 38, RIGHT: 39, DOWN:40}),

   init:function() {
      // keyboard listener for sprite control
      document.addEventListener("keydown", function(event) {
         if(event.which >= Sprite.keycode.LEFT && event.which <= Sprite.keycode.DOWN) {
            event.preventDefault(); // prevent arrow keys from scrolling
            Sprite.direction = event.which;
            Sprite.takeStep();
         }
      });
      $(window).on('load', function() {
         Sprite.sprite = document.getElementById("sprite");
         Sprite.cacheImages();
      });
      Sprite.direction = Sprite.keycode.RIGHT;
   },

   cacheImages:function() {
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
    * takeStep()
    * change direction and location of sprite
    */
   takeStep:function() {
      Sprite.step = (Sprite.step + 1) % Sprite.stepsInCycle;

      switch(Sprite.direction) {
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

      if(Sprite.sprite.getBoundingClientRect().top > $(window).height()) {
         Sprite.posY -= $(window).height();
      }
      if(Sprite.sprite.getBoundingClientRect().left > $(window).width()) {
         Sprite.posX -= $(window).width();
      }
      if(Sprite.sprite.getBoundingClientRect().top < 0) {
         Sprite.posY += $(window).height();
      }
      if(Sprite.sprite.getBoundingClientRect().left < 0) {
         Sprite.posX += $(window).width();
      }

      Sprite.sprite.style.left = Sprite.posX + 'px';
      Sprite.sprite.style.top = Sprite.posY + 'px';
      Sprite.sprite.src = "img/me/" + Sprite.directionText[Sprite.direction] + Sprite.step + ".png";

      if(Sprite.step != 0) setTimeout(function() { Sprite.takeStep(); }, 60);
   },

   /**
    * startWalking()
    * begin cycling timer for walking animation
    */
   startWalking:function() {
      Sprite.walker = setInterval("Sprite.walk();", 100);
   },

   /**
    * walk()
    * auto walking animation cycling through the sprite in the current direction
    */
   walk:function() {
      Sprite.step = (Sprite.step + 1) % Sprite.stepsInCycle;
      Sprite.sprite.src = "img/me/" + Sprite.directionText[Sprite.direction] + Sprite.step + ".png";
   },

   /**
    * stopWalking()
    * pause the walking animation timer
    */
   stopWalking:function() {
      clearInterval(Sprite.walker);
   }
}

Terminal.file="text/intro.txt";
Terminal.resume="text/resume.txt";
Terminal.userName = "cristianlara"

Terminal.init();
Sprite.init();
Terminal.startTyping();
