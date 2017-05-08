var Terminal = {

   userName:"",
   text:"",              // to contain the content of the text file
   asciiArt:"",          // name of text file with ascii art (my name)
   index:0,              // current cursor position in the text to add
   speed:1,              // number of letters to add at a time
   file:"",              // name of text file to get text from
   pending:"",           // pending string of text to type
   insertingHtml:false,  // indicates if we are inserting text between html tags
   contentOffset:0,      // the offset in the content compared to the textfile
   pauseDuration:500,    // duration of pause action in milliseconds
   htmlIndicator:"<",    // character indicating that we have encountered html
   acceptingInput:false, // indicating if accepting user input
   input:"",             // input text from user

   // keycode constants
   keycode:Object.freeze({ENTER: 13, BACKSPACE: 8}),

   // these characters are interpreted as special actions when read
   // i.e. linebreak, pause, clear
   specialCharacters:["\n", "\\", "`", "$", "%", "^"],

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
            // Terminal.write("1");
            // Terminal.input += "1";
            Terminal.write('\n');
            Terminal.acceptingInput = false;
            Terminal.printResume();
         });
      });
   },

   /**
   * content()
   * returns the content in the terminal
   */
   content:function() {
      return $("#console").html();
   },

   /**
   * write(str)
   * appends str to the end of the terminal
   */
   write:function(str) {
      Terminal.removeCursor();
      $("#console").append(str);
      return false;
   },

   /**
   * insert(str)
   * inserts strings into the current place of the cursor
   * this is primarily for inserting text between html tags
   */
   insert:function(str) {
      Terminal.removeCursor();
      var content = Terminal.content();
      var contentBefore = 
         content.substring(0, Terminal.index + Terminal.contentOffset - 1);
      var contentAfter = 
         content.substring(Terminal.index + Terminal.contentOffset - 1);

      $("#console").html(contentBefore + str + contentAfter);
   },

   /**
   * clear()
   * clears the terminal of all text and html
   */
   clear:function() {
      $("#console").html("");
   },


   /**
   * addInputListener()
   * adds a keyboard listener to allow input to the terminal
   */
   addInputListener:function() {
      document.addEventListener("keypress", function(event) {
            event.preventDefault();
            if(Terminal.acceptingInput) {
               character = String.fromCharCode(event.which);

               // User hit enter
               if (event.which == Terminal.keycode.ENTER) {
                  Terminal.acceptingInput = false;
                  console.log("Your input was: " + Terminal.input);
                  Terminal.contentOffset--;
                  if (Terminal.input == "1") {
                     Terminal.input = "";
                     Terminal.printResume();
                  }
                  else if (Terminal.input == "2") {
                     Terminal.showMessage(2);
                     downloadResume();
                  }
                  else if (Terminal.input == "3") {
                     Terminal.showMessage(3);
                     emailMe();
                  }
                  else {
                     Terminal.showMessage(-1);
                  }
               }

               // User hit backspace
               else if (event.which == Terminal.keycode.BACKSPACE) {
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
               //TODO
               // clearInterval(timer);
               // $("#console").html(Terminal.text);
               // Terminal.acceptingInput = true;
            }
      });
      document.addEventListener("keydown", function(event) {
         event.preventDefault();
         console.log(event.which);
         if (event.which == 39) {
            Terminal.moveMehran("right");
         } else if (event.which == 37) {
            Terminal.moveMehran("left");
         } else if (event.which == 40) {
            Terminal.moveMehran("down");
         } else if (event.which == 38) {
            Terminal.moveMehran("up");
         }
      });
   },

   mehranX:0, mehranY:0, mehranStep:0, mehranStepSize:8,

   moveMehran:function(direction) {
      Terminal.mehranStep = (Terminal.mehranStep + 1) % 9;

      switch(direction) {
         case "right":
            Terminal.mehranX += Terminal.mehranStepSize;
            break;

         case "left":
            Terminal.mehranX -= Terminal.mehranStepSize;
            break;

         case "down":
            Terminal.mehranY += Terminal.mehranStepSize;
            break;

         case "up":
            Terminal.mehranY -= Terminal.mehranStepSize;
            break;

      }

      var mehran = document.getElementById("mehran");
      mehran.style.left = Terminal.mehranX;
      mehran.style.top = Terminal.mehranY;
      mehran.src = "img/me/" + direction + Terminal.mehranStep + ".png";
   },



   clearInput:function() {
      Terminal.offset -= Terminal.input.length;
      Terminal.input = "";
   },

   showMessage:function(code) {
      switch(code) {
         // download resume
         case 2:
            Terminal.text += " \ndownloading resume...\n\n$";
            break;

         // Contact me
         case 3:
            Terminal.text += " \ncontacting me at cristianlara@stanford.edu...\n\n$";
            break;

         // Error code
         case (-1):
            Terminal.text += " \n<span class=\"error\">enter number between 1 and 3...</span>\n\n$";
            break;

         default:
            break;
      }
      startTyping();
      Terminal.clearInput();
   },

   /**
   * handleSpecialCharacter(char)
   * handle special characters with the following actions
   *
   * \n : insert <br> tag
   * $  : insert terminal prompt
   * `  : pause before typing more
   * \  : clear terminal
   * %  : insert ascii art
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
         Terminal.acceptingInput = true;
      }
      else if(char.includes("^")) {
         Terminal.contentOffset -= "^".length;
         Terminal.acceptingInput = false;
      }
      else if(char.includes("`")) {
         Terminal.contentOffset -= 1;
         stopTyping();
         setTimeout(startTyping, Terminal.pauseDuration);
      }
      else if(char.includes("\\")) {
         Terminal.clear();
         Terminal.contentOffset = -Terminal.index;
      }
      else if(char.includes("%")) {
         clearInterval(timer);
         $.get(Terminal.asciiArt,function(data){
            Terminal.insert(data);
            Terminal.contentOffset += data.length - 1;
            startTyping();
         });
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
   * Goes through the text file typing it out into the Terminal.
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
         // console.log(Terminal.pending);
         Terminal.insert(Terminal.pending);
         // console.log(Terminal.content());
      }

      window.scrollBy(0,50); // scroll to make sure bottom is always visible
      
   },

   printResume:function() {
      $.get(Terminal.resume,function(resumeData){
         Terminal.text += resumeData;
         startTyping();
      });
   },

   /**
   * removeLastCharacter()
   * removes the last character in the Terminal's content
   */
   removeLastCharacter:function() {
        var content = Terminal.content();
        $("#console").html(content.substring(0, content.length - 1));
   },

   /**
   * cursorIsOn()
   * returns true if the cursor is being displayed, false otehrwise
   */
   cursorIsOn:function() {
      var content = Terminal.content();
      return content.substring(content.length - 1, content.length) == "|";
   },

   /**
   * removeCursor()
   * removes the cursor if it is currently being displayed
   */
   removeCursor:function(){
      var content = Terminal.content();
      if(Terminal.cursorIsOn())
         Terminal.removeLastCharacter();
   },

   /**
   * blink()
   * blink the cursor by removing and reading it
   */
   blink:function(){
      var content = Terminal.content();
      if(Terminal.cursorIsOn())
         Terminal.removeLastCharacter();
      else
         Terminal.write("|");
   }
}

Terminal.file="text/intro.txt";
Terminal.resume="text/resume.txt";
Terminal.asciiArt="text/asciiArt.txt";
Terminal.userName = "cristianlara"

Terminal.init();

var timer = null;
startTyping();

function startTyping() {
   timer = setInterval("type();", 1);
}

function stopTyping() {
   clearInterval(timer);
}

function type() {
   Terminal.addText();
   if (Terminal.index > Terminal.text.length) {
      stopTyping();
   }
}

function downloadResume() {
   document.getElementById("two").click();
}

function emailMe() {
   document.getElementById("three").click();
}
