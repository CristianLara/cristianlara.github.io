var Typer={
   text:null,
   accessCountimer:null,
   index:0, // current cursor position
   speed:2, // speed of the Typer
   file:"", //file, must be set
   pending:"", // next string of text to type

   init:function(){ // inizialize Hacker Typer
      accessCountimer = setInterval(function(){Typer.blink();},500); // inizialize timer for blinking cursor
      $.get(Typer.file,function(data){ // get the text file
         Typer.text=data; // save the textfile in Typer.text
         // Typer.text = Typer.text.slice(0, Typer.text.length-1);
      });
   },

   content:function(){
      return $("#console").html(); // get console content
   },

   write:function(str){ // append to console content
      $("#console").append(str);
      return false;
   },

   addText:function(key){ //Main function to add the code
      if(Typer.text){ // otherway if text is loaded
         var cont=Typer.content(); // get the console content
         if(cont.substring(cont.length-1,cont.length)=="|") // if the last char is the blinking cursor
            $("#console").html($("#console").html().substring(0,cont.length-1)); // remove it before adding the text

         Typer.index+=Typer.speed;

         // if(key.keyCode!=8){ // if key is not backspace
         //    Typer.index+=Typer.speed;  // add to the index the speed
         // }else{
         //    if(Typer.index>0) // else if index is not less than 0
         //       Typer.index-=Typer.speed; //  remove speed for deleting text
         // }

         var text=Typer.text.substring(0,Typer.index) // parse the text for stripping html enities
         var rtn= new RegExp("\n", "g"); // newline regex

         // $("#console").html(text.replace("\n","<br/>"));
         $("#console").html(text.replace(rtn,"<br/>")); // replace newline chars with br, tabs with 4 space and blanks with an html blank
         window.scrollBy(0,50); // scroll to make sure bottom is always visible
      }
      // if ( key.preventDefault && key.keyCode != 122 ) { // prevent F11(fullscreen) from being blocked
      //    key.preventDefault()
      // };
      // if(key.keyCode != 122){ // otherway prevent keys default behavior
      //    key.returnValue = false;
      // }
   },

   addText2:function(key){ //Main function to add the code
      if(Typer.text){ // otherway if text is loaded
         var cont=Typer.content(); // get the console content
         this.removeCursor();

         Typer.index+=Typer.speed;

         var text=Typer.text.substring(0,Typer.index) // parse the text for stripping html enities

         $("#console").html(text.replace("\n","<br/>"));
         window.scrollBy(0,50); // scroll to make sure bottom is always visible
      }
   },

   addText3:function(key){ //Main function to add the code
      if(Typer.text){ // otherway if text is loaded
         var cont=Typer.content(); // get the console content
         this.removeCursor();

         Typer.index+=Typer.speed;

         var text=Typer.text.substring(0,Typer.index) // parse the text for stripping html enities

         Typer.pending += Typer.text.substring(Typer.index - Typer.speed, Typer.index);
         if(Typer.pending.includes("<")) {

         } else if(Typer.pending.includes(">")) {
            Typer.pending.replace("\n", "<br/>");
            Typer.write(Typer.pending);
            Typer.pending = "";
         }


         // Typer.write(Typer.text.substring(Typer.index - Typer.speed, Typer.index).replace("\n","<br/>"));
         window.scrollBy(0,50); // scroll to make sure bottom is always visible
      }
   },

   removeCursor:function(){
      var cont=this.content(); // get console
      if(cont.substring(cont.length-1,cont.length)=="|") // if last char is the cursor
         $("#console").html($("#console").html().substring(0,cont.length-1)); // remove it
   },

   blink:function(){ // blinking cursor
      var cont=this.content(); // get console
      if(cont.substring(cont.length-1,cont.length)=="|") // if last char is the cursor
         $("#console").html($("#console").html().substring(0,cont.length-1)); // remove it
      else
         this.write("|"); // else write it
   }
}

function replaceUrls(text) {
   var http = text.indexOf("http://");
   var space = text.indexOf(".me ", http);
   if (space != -1) {
      var url = text.slice(http, space-1);
      return text.replace(url, "<a href=\""  + url + "\">" + url + "</a>");
   } else {
      return text
   }
}

Typer.speed=1;
Typer.file="terminalText.txt";
Typer.init();

var timer = setInterval("t();", 20);
function t() {
   Typer.addText({"keyCode": 123748});
   if (Typer.index > Typer.text.length) {
      clearInterval(timer);
   }
}
