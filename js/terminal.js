
var Terminal = {

   userName: "",
   text: "",              // to contain the content of the text file
   index: 0,              // current cursor position in the text to add
   speed: 1,              // number of letters to add at a time
   file: "",              // name of text file to get text from
   pending: "",           // pending string of text to type
   insertingHtml: false,  // indicates if we're inserting text between html tags
   contentOffset: 0,      // the offset in the content compared to the textfile
   pauseDuration: 500,    // duration of pause action in milliseconds
   htmlIndicator: "<",    // character indicating that we have encountered html
   acceptingInput: false, // indicating if accepting user input
   input: "",             // input text from user
   skip: false,           // controls skipping typing animation
   isMobile: false,       // indicates if user is on a touch device
   lastMobileInput: "",   // tracks last mobile input value for backspace detection

   // keycode constants
   keycode: Object.freeze({ ENTER: 13, BACKSPACE: 8, SPACE: 32 }),

   // these characters are interpreted as special actions when read
   // i.e. linebreak, pause, clear, preformatted message
   specialCharacters: ["\n", "\\", "`", "$"],

   /**
    * isValidChar(char)
    * Check if character is alphanumeric
    */
   isValidChar: function (char) {
      if (!char || char.length !== 1) return false;
      return (char >= 0 && char <= 9) ||
         (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')
   },

   /**
    * init()
    * Starts cursor blinking, reads textfile and stores in Terminal.text
    * Adds click events to action links
    */
   init: function () {
      setInterval(function () { Terminal.blink(); }, 500); // start cursor blink

      $.get(Terminal.file, function (data) {
         Terminal.text = data; // save the textfile in Terminal.text
      });

      Terminal.addInputListener();

      //add click actions for links before they're even added
      $(window).on('load', function () {
         Terminal.setupMobileInput();
         $("#console").on('click', "#one", function () {
            Terminal.clearInput();
            Terminal.write('\n');
            Terminal.acceptingInput = false;
            document.getElementById('console').classList.remove('accepting-input');
            Terminal.printResume();
         });
         $("#console").on('click', "#three", function () {
            Terminal.clearInput();
            Terminal.write('3');
            Terminal.acceptingInput = false;
            document.getElementById('console').classList.remove('accepting-input');
            Terminal.showMessage(3);
         });
      });
   },

   /**
    * setupMobileInput()
    * Sets up hidden input field for mobile typing
    */
   setupMobileInput: function () {
      var mobileInput = document.getElementById('mobile-input');
      var tapHint = document.getElementById('tap-hint');
      var console = document.getElementById('console');

      // Focus hidden input when terminal area is tapped
      var focusInput = function (e) {
         if (Terminal.acceptingInput) {
            mobileInput.focus();
            if (tapHint) tapHint.classList.add('hidden');
            window.scrollBy({ top: 5000, behavior: "smooth" });
         } else {
            // Show visual feedback that terminal is not ready
            console.classList.remove('not-ready');
            void console.offsetWidth; // Trigger reflow to restart animation
            console.classList.add('not-ready');
            setTimeout(function () {
               console.classList.remove('not-ready');
            }, 600);
         }
      };

      // focus when clicking directly on console
      console.addEventListener('click', function (e) {
         // Don't focus if clicking on a link or the tap hint button
         if (!e.target.closest('a') && !e.target.closest('#tap-hint')) {
            focusInput(e);
         }
      });

      // Handle tap hint button click
      tapHint.addEventListener('click', function (e) {
         focusInput(e);
      });

      // Direct tap on the input field should also hide the hint
      mobileInput.addEventListener('focus', function () {
         if (tapHint) tapHint.classList.add('hidden');
         window.scrollBy({ top: 5000, behavior: "smooth" });
      });
      // Show hint again when input loses focus
      mobileInput.addEventListener('blur', function () {
         if (tapHint && Terminal.acceptingInput) {
            tapHint.classList.remove('hidden');
         }
      });
   },

   /**
    * isTypingOnMobile()
    * Check if we're currently typing on mobile
    */
   isTypingOnMobile: function () {
      var mobileInput = document.getElementById('mobile-input');
      return mobileInput && mobileInput === document.activeElement;
   },

   /**
    * processCharacter(char)
    * Process a single character input (extracted for reuse)
    */
   processCharacter: function (char) {
      if (!Terminal.acceptingInput) return;

      Terminal.removeCursor();
      Terminal.write(char);
      Terminal.input += char;
      Terminal.contentOffset++;
   },

   /**
    * processBackspace()
    * Handle backspace (extracted for reuse)
    */
   processBackspace: function () {
      if (!Terminal.acceptingInput) return;

      if (Terminal.input.length > 0) {
         Terminal.removeCursor();
         Terminal.removeLastCharacter();
         Terminal.contentOffset--;
         var length = Terminal.input.length;
         Terminal.input = Terminal.input.substring(0, length - 1);
      }
   },

   /**
    * processEnter()
    * Handle enter key/command submission (extracted for reuse)
    */
   processEnter: function () {
      if (!Terminal.acceptingInput) return;

      Terminal.acceptingInput = false;
      document.getElementById('console').classList.remove('accepting-input');
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
   },

   /**
    * startTyping()
    * begins the Terminal's process of automatically typing text
    */
   startTyping: function () {
      Terminal.typer = setInterval(function () { Terminal.type(); }, 1);
   },

   /**
    * type()
    * repeating function which keeps adding text as long as there
    * is text left to type
    */
   type: function () {
      Terminal.addText();
      if (Terminal.index > Terminal.text.length) {
         Terminal.stopTyping();
      }

      if (Terminal.skip) {
         Terminal.stopTyping();
         while (Terminal.index <= Terminal.text.length) {
            Terminal.addText();
         }
         Terminal.skip = false;
      }
   },

   /**
    * stopTyping()
    * pause the Terminal's typing
    */
   stopTyping: function () {
      clearInterval(Terminal.typer);
   },

   /**
    * content()
    * returns the content in the terminal
    */
   content: function () {
      return $("#text").html();
   },

   /**
    * write(str)
    * appends str to the end of the terminal
    */
   write: function (str) {
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
   insert: function (str) {
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
   clear: function () {
      $("#text").html("");
   },


   /**
    * addInputListener()
    * adds keyboard listener to allow input to the terminal
    * also adds listener to allow for control of the sprite
    */
   addInputListener: function () {
      // keyboard listener for terminal input
      document.addEventListener("keydown", function (event) {
         if (Terminal.acceptingInput) {
            // User hit enter
            if (event.which == Terminal.keycode.ENTER) {
               event.preventDefault();
               Terminal.processEnter();
            }

            // User hit backspace
            else if (event.which == Terminal.keycode.BACKSPACE) {
               event.preventDefault();
               Terminal.processBackspace();
            }

            // User hit a printable character key
            else {
               var character = String.fromCharCode(event.which);
               if (Terminal.isValidChar(character)) {
                  Terminal.processCharacter(character.toLowerCase());
               }
            }
         }
         else {
            if (event.which == Terminal.keycode.SPACE) {
               // skip animation
               Terminal.skip = true;
            } else {
               // Show visual feedback that terminal is not ready
               document.getElementById('console').classList.remove('not-ready');
               void document.getElementById('console').offsetWidth; // Trigger reflow to restart animation
               document.getElementById('console').classList.add('not-ready');
               setTimeout(function () {
                  document.getElementById('console').classList.remove('not-ready');
               }, 600);
            }
         }
      });
   },

   clearInput: function () {
      Terminal.offset -= Terminal.input.length;
      Terminal.input = "";
   },

   showMessage: function (code) {
      Terminal.text += " \n";
      switch (code) {
         // download resume
         case 2:
            Terminal.text += "downloading resume...";
            break;

         // contact me
         case 3:
            Terminal.text += "you can contact me at "
               + "<a class=\"c\" href=\"mailto:cristianlara@alumni.stanford.edu\">cristianlara@alumni.stanford.edu</a>";
            break;

         // pokemon
         case 4:
            Terminal.text += "initiating pokemon...";
            break;

         // error code
         case (-1):
            Terminal.text += "<span class=\"error\">"
               + "enter number between 1 and 3...</span>";
            break;

         default:
            break;
      }
      Terminal.text += "\n\n$"
      Terminal.startTyping();
      Terminal.clearInput();
   },

   downloadResume: function () {
      document.getElementById("two").click();
   },

   emailMe: function () {
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
   handleSpecialCharacter: function (char) {
      if (char.includes("\n")) {
         Terminal.insert("<br>");
         Terminal.contentOffset += "<br>".length - "\n".length;
      }
      else if (char.includes("$")) {
         var prompt = "<span class=\"a\">root@" + Terminal.userName + "</span>:" +
            "<span class=\"b\">~</span>" +
            "<span class=\"c\">$</span> ";
         Terminal.insert(prompt);
         Terminal.contentOffset += prompt.length - "~".length;
         if (Terminal.index > 3) {
            Terminal.acceptingInput = true;
            // Add visual indicator that terminal is ready for input
            document.getElementById('console').classList.add('accepting-input');
         }
      }
      else if (char.includes("`")) {
         Terminal.contentOffset -= "`".length;
         if (!Terminal.skip) {
            Terminal.stopTyping();
            setTimeout(Terminal.startTyping, Terminal.pauseDuration);
         }
      }
      else if (char.includes("\\")) {
         Terminal.clear();
         Terminal.contentOffset = -Terminal.index;
      }
   },

   /**
    * handleHtml()
    * Adds encountered html tags to the content, then offsets index to add
    * next characters between the tags until the end tag is reached.
    */
   handleHtml: function () {
      if (Terminal.insertingHtml) {
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
   },

   /**
    * addText()
    * Goes through text file typing it into the Terminal one letter at a time.
    * Recognizes html and adds the tags before typing out the inner content.
    */
   addText: function () {
      if (!Terminal.text) return;
      Terminal.removeCursor();

      Terminal.index += Terminal.speed;
      Terminal.pending = Terminal.text.charAt(Terminal.index - 1);

      // if the next character indicates an action
      if (Terminal.specialCharacters.includes(Terminal.pending)) {
         Terminal.handleSpecialCharacter(Terminal.pending);
      }
      // if the next character is an html tag
      else if (Terminal.pending == (Terminal.htmlIndicator)) {
         Terminal.handleHtml();
      }
      // it's just a normal character to insert
      else {
         Terminal.insert(Terminal.pending);
      }

      window.scrollBy(0, 5000); // scroll to make sure bottom is always visible

   },

   printResume: function () {
      $.get(Terminal.resume, function (resumeData) {
         Terminal.text += resumeData;
         Terminal.startTyping();
      });
   },

   /**
    * removeLastCharacter()
    * removes the last character in the Terminal's content
    */
   removeLastCharacter: function () {
      var content = Terminal.content();
      $("#text").html(content.substring(0, content.length - 1));
   },

   /**
    * cursorIsOn()
    * returns true if the cursor is being displayed, false otehrwise
    */
   cursorIsOn: function () {
      var content = $("#cursor").html();
      return content == "|";
   },

   /**
    * removeCursor()
    * removes the cursor if it is currently being displayed
    */
   removeCursor: function () {
      if (Terminal.cursorIsOn())
         $("#cursor").html("");
   },

   /**
    * blink()
    * blink the cursor by removing and reading it
    */
   blink: function () {
      var content = Terminal.content();
      if (Terminal.cursorIsOn())
         $("#cursor").html("");
      else
         $("#cursor").html("|");
   }
}

Terminal.file = "text/intro.txt";
Terminal.resume = "text/resume.txt";
Terminal.userName = "cristianlara"

Terminal.init();
Terminal.startTyping();
