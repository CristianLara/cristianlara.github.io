var Terminal = {

   userName:"",
   text:"",             // to contain the content of the text file
   asciiArt:"",         // name of text file with ascii art (my name)
   index:0,             // current cursor position
   speed:1,             // number of letters to add at a time
   file:"",             // name of text file to get text from
   pending:"",          // pending string of text to type
   insertingHtml:false, // indicates if we are inserting text between html tags
   contentOffset:0,     // the offset in the content compared to the textfile
   pauseDuration:500,   // duration of pause action in milliseconds
   htmlIndicator:"<",   // character indicating that we have encountered html
   acceptingInput:false, // boolean indicating if accepting user input
   input:"",
   
   // these characters are interpreted as special actions when read
   // i.e. linebreak, pause, clear
   specialCharacters:["\n", "\\", "`", "$", "%", "^"],

   /**
   * init()
   * Starts cursor blinking, reads textfile and stores in Terminal.text
   */
   init:function() {
      setInterval(function(){Terminal.blink();},500); // start cursor blink
      $.get(Terminal.file,function(data){
         Terminal.text = data; // save the textfile in Terminal.text
      });
      Terminal.addInputListener();
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
      $("#console").append(str);
      return false;
   },

   /**
   * insert(str)
   * appends str to the end of the terminal
   */
   insert:function(str) {
      var content = Terminal.content();
      var contentBefore = 
         content.substring(0, Terminal.index + Terminal.contentOffset - 1);
      var contentAfter = 
         content.substring(Terminal.index + Terminal.contentOffset - 1);

      $("#console").html(contentBefore + str + contentAfter);
   },

   /**
   * clear()
   * clears the terminal
   */
   clear:function() {
      $("#console").html("");
   },


   /**
   * clear()
   * clears the terminal
   */
   addInputListener:function() {
      document.addEventListener("keypress", function(event) {
            event.preventDefault();
            if(Terminal.acceptingInput) {
               character = String.fromCharCode(event.which);
               // if (character == ' ') return;
               if (event.which == 13) {
                  // Terminal.acceptingInput = false;
                  console.log("Your input was: " + Terminal.input);
               }
               else if (event.which == 8) { // backspace
                  if(Terminal.input.length > 0) {
                     Terminal.removeCursor();
                     Terminal.removeLastCharacter();
                     length = Terminal.input.length;
                     Terminal.input = Terminal.input.substring(0, length - 1);                     
                  }
               }
               else if ((character >= 0 && character <= 9) ||
                    (character >= 'a' && character <= 'z')) {
                  Terminal.removeCursor();
                  console.log("pressed: " + character + "\n");
                  Terminal.write(character);
                  Terminal.input += character;
               }
            }   
      });
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
                      "<span class=\"c\">$</span>";
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
         clearInterval(timer);
         setTimeout(startTyping, Terminal.pauseDuration);
      }
      else if(char.includes("\\")) {
         Terminal.clear();
         Terminal.contentOffset = -Terminal.index;
      }
      else if(char.includes("%")) {
         clearInterval(timer);
         $.get(Terminal.asciiArt,function(data){
            Terminal.insert(data); // save the textfile in Terminal.text
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
      // Terminal.pending = Terminal.text.substring(
         // Terminal.index - Terminal.speed, Terminal.index);

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
   * blink th cursor by removing and readding it
   */
   blink:function(){
      var content = Terminal.content();
      if(Terminal.cursorIsOn())
         Terminal.removeLastCharacter();
      else
         Terminal.write("|");
   }
}

Terminal.file="terminalTextBash2.txt";
Terminal.asciiArt="asciiArt.txt";
Terminal.userName = "cristianlara"

Terminal.init();

var timer = null;
startTyping();

function startTyping() {
   timer = setInterval("type();", 3);
}

function type() {
   Terminal.addText();
   if (Terminal.index > Terminal.text.length) {
      clearInterval(timer);
   }
}
