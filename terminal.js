var Terminal = {

   userName:"",
   text:"",             // to contain the content of the text file
   index:0,             // current cursor position
   speed:1,             // number of letters to add at a time
   file:"",             // name of text file to get text from
   pending:"",          // pending string of text to type
   insertingHtml:false, // indicates if we are inserting text between html tags
   contentOffset:0,     // the offset in the content compared to the textfile

   /**
   * These special characters indicate specific actions for the Terminal
   * \n : insert <br>
   * ~  : insert terminal prompt
   * `  : pause before typing more
   */
   specialCharacters:["\n", "~", "`"],

   /**
   * init()
   * Starts cursor blinking, reads textfile and stores in Terminal.text
   */
   init:function() {
      setInterval(function(){Terminal.blink();},500); // start cursor blink
      $.get(Terminal.file,function(data){
         Terminal.text = data; // save the textfile in Terminal.text
      });
   },

   /**
   * content()
   * returns the content in the console
   */
   content:function() {
      return $("#console").html();
   },

   /**
   * write(str)
   * appends str to the end of the console
   */
   write:function(str) {
      $("#console").append(str);
      return false;
   },

   /**
   * insert(str)
   * appends str to the end of the console
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
   * handleSpecialCharacter(char)
   * handle special characters with the following actions
   *
   * \n : insert <br> tag
   * ~  : insert terminal prompt
   * `  : pause before typing more
   */
   handleSpecialCharacter:function(char) {
      if(char.includes("\n")) {
         Terminal.insert("<br>");
         Terminal.contentOffset += "<br>".length - "\n".length;
      }
      else if(char.includes("~")) {
         Terminal.insert(Terminal.userName);
         Terminal.contentOffset += Terminal.userName.length - "~".length;
      }
      else if(char.includes("`")) {
         Terminal.contentOffset -= 1;
         clearInterval(timer);
         setTimeout(startTyping, 500);
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
      Terminal.pending = Terminal.text.substring(
         Terminal.index - Terminal.speed, Terminal.index);

      if(Terminal.specialCharacters.includes(Terminal.pending)) {
         Terminal.handleSpecialCharacter(Terminal.pending);
         return;
      }

      if(Terminal.pending.includes("<")) { // we encountered HTML
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

            var openTag = Terminal.text.substring(Terminal.index - 1, endOfOpenTag + 1);
            var closeTag = Terminal.text.substring(startOfCloseTag, endOfCloseTag + 1);

            Terminal.insert(openTag + closeTag);

            Terminal.index += openTag.length - 1;
         }
      } else {
         Terminal.insert(Terminal.pending);
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

Terminal.speed=1;
Terminal.file="terminalText.txt";
Terminal.userName = "<span id=\"a\">root@cristianlara</span>:" + 
                    "<span id=\"b\">~</span>" +
                    "<span id=\"c\">$</span>"

Terminal.init();

var timer = null;
startTyping();

function startTyping() {
   timer = setInterval("type();", 20); //20
}

// function continueTyping() {
//    Terminal.insert("<br>");
//    Terminal.contentOffset += "<br>".length - "\n".length;
//    timer = setInterval("type();", 20); //20
// }

function type() {
   Terminal.addText();
   if (Terminal.index > Terminal.text.length) {
      clearInterval(timer);
   }
}
