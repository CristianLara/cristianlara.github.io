var Terminal = {

   text:null,           // to contain the content of the text file
   index:0,             // current cursor position
   speed:1,             // number of letters to add at a time
   file:"",             // name of text file to get text from
   pending:"",          // pending string of text to type
   insertingHtml:false, // indicates if we are inserting text between html tags
   htmlIndex:0,         // the index pointing right before the html close tag
   htmlOffset:0,        // the offset in the content compared to the textfile

   /**
   * init()
   * Starts cursor blinking, reads textfile and stores in Terminal.text
   */
   init:function() {
      setInterval(function(){Terminal.blink();},500); // start cursor blink
      $.get(Terminal.file,function(data){
         Terminal.text=data; // save the textfile in Terminal.text
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
   * insertBetweenHtmlTags()
   * keeps track of a separate index of the space between the current tags
   * inserts pending characters between tags
   */
   insertBetweenHtmlTags:function() {
      Terminal.htmlIndex += Terminal.speed;
      var htmlContent = Terminal.text.substring(
        Terminal.htmlIndex - Terminal.speed, Terminal.htmlIndex);
      if(htmlContent.includes("<")) {
         Terminal.insertingHtml = false;
         return;
      }
      var cont = Terminal.content();
      var contentBefore = cont.substring(0, Terminal.htmlIndex + Terminal.htmlOffset - 1);
      var contentAfter = cont.substring(Terminal.htmlIndex - 1 + Terminal.htmlOffset);
      $("#console").html(contentBefore + htmlContent + contentAfter);
   },

   /**
   * addText()
   * Goes through the text file typing it out into the Terminal.
   * Recognizes html and adds the tags before typing out the inner content.
   */
   addText:function() {
      if(!Terminal.text) return;
      Terminal.removeCursor();

      if(Terminal.insertingHtml) {
         Terminal.insertBetweenHtmlTags();
      } else {
         Terminal.index += Terminal.speed;
         Terminal.pending = Terminal.text.substring(
            Terminal.index - Terminal.speed, Terminal.index);

         // if the next character is a line break, replace it with a <br> tag
         // makes the content 3 characters longer than the text file
         if(Terminal.pending.includes("\n")) {
            Terminal.write("<br>");
            Terminal.htmlOffset += 3;
            return;
         }

         if(Terminal.pending.includes("<")) { // we encountered HTML
            var endOfOpenTag = Terminal.text.indexOf(">", Terminal.index);
            var startOfCloseTag = Terminal.text.indexOf("<", endOfOpenTag);
            var endOfCloseTag = Terminal.text.indexOf(">", startOfCloseTag);

            var openTag = Terminal.text.substring(Terminal.index - 1, endOfOpenTag + 1);
            var closeTag = Terminal.text.substring(startOfCloseTag, endOfCloseTag + 1);

            Terminal.write(openTag + closeTag);

            Terminal.insertingHtml = true;
            Terminal.index = endOfCloseTag + 1;
            Terminal.htmlIndex = endOfOpenTag + 1;

         } else {
            Terminal.write(Terminal.pending);
         }
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
Terminal.init();

var timer = setInterval("t();", 20);
function t() {
   Terminal.addText();
   if (Terminal.index > Terminal.text.length) {
      clearInterval(timer);
   }
}
