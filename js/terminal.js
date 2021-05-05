
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
         $("#console").on('click', "#three", function() {
            Terminal.clearInput();
            Terminal.write('3');
            Terminal.acceptingInput = false;
            Terminal.showMessage(3);
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
            Terminal.text += "you can contact me at "
                          +  "<a class=\"c\" href=\"mailto:cristianlara@alumni.stanford.edu\">cristianlara@alumni.stanford.edu</a>";
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
    * Goes through text file typing it into the Terminal one letter at a time.
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

Terminal.file="text/intro.txt";
Terminal.resume="text/resume.txt";
Terminal.userName = "cristianlara"

Terminal.init();
Terminal.startTyping();
