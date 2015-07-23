// /////////////// controller code ////////////////

// // effective region of stick is some radius around current position
// var joystick = function(canvas, baseX, baseY){
//   var context = canvas.getContext("2d");
//   var baseStickCoors = {x: baseX, y: baseY};  
//   var currStickCoors = {x: baseX, y: baseY};
//   var effRadius = 10
//   var pressed = 0;

//   function press(coors) {
//     console.log("press: " + coors.x + "  " + coors.y + "   " + pressed);
//     console.log(this);
//     pressed = 1;
//     console.log(pressed);
//     currStickCoors = coors;
//   };
//   function unpress(coors) {
//     console.log("unpress: " + coors.x + "  " + coors.y + "   " + pressed);
//     pressed = 0;
//     console.log(pressed);
//     currStickCoors = baseStickCoors;
//   };
//   function updatePosition(coors){
//     console.log("updatePosition: " + coors.x + "  " + coors.y);
//     if(pressed == 1){
//       currStickCoors = coors;
//     }
//   };

//   return{
//     pressed: pressed,
//     effect: {mousedown:  press,
//              touchstart: press,
//              mouseup:  unpress,
//              touchend:   unpress,
//              mousemove:  updatePosition,              
//              touchmove:  updatePosition
//            },
//     effectedByGesture: function(coors) {
//       // console.log("coors: ", coors);
//       // console.log("stick: " + currStickCoors.x + ", " + currStickCoors.y);
//       // console.log("dist: ", distance(stickPosX, coors.x, currStickCoors.y, coors.y), coors, currStickCoors.x + ", " + currStickCoors.y, (distance(stickPosX, coors.x, currStickCoors.y, coors.y) < effRadius));
//       return distance(currStickCoors.x, coors.x, currStickCoors.y, coors.y) < effRadius;
//     },
//     draw: function(){
//       context.clearRect(0,0,canvas.width,canvas.height); 
//       //base of joystick
//       var grd = context.createRadialGradient(baseStickCoors.x-25, baseStickCoors.y-25, 25, baseStickCoors.x+25, baseStickCoors.y+25, 25);
//       grd.addColorStop(0, "#8ED6FF"); // light blue
//       grd.addColorStop(1, "#004CB3"); // dark blue    

//       context.fillStyle = grd;        
//       context.beginPath();
//       //draw arc: arc(x, y, radius, startAngle, endAngle, anticlockwise)
//       context.arc(baseStickCoors.x, baseStickCoors.y, 25, Math.PI*2, 0, true);
//       //end drawing
//       context.closePath()
//       //fill it so you could see it
//       context.fill();

//       //actual joystick
//       var grd2 = context.createRadialGradient(currStickCoors.x-15, currStickCoors.y-15, 15, currStickCoors.x+15, currStickCoors.y+15, 15);        
//       grd2.addColorStop(0, "#FF9999"); // light red
//       grd2.addColorStop(1, "#990000"); // dark red        
//       context.fillStyle = grd2;       
//       context.beginPath();
//       //draw arc: arc(x, y, radius, startAngle, endAngle, anticlockwise)
//       context.arc(currStickCoors.x, currStickCoors.y, 15, Math.PI*2, 0, true);
//       //end drawing
//       context.closePath()
//       //fill it so you could see it
//       context.fill();


//       // shoe effected area
//       var effArea = context.createRadialGradient(currStickCoors.x-effRadius, currStickCoors.y-effRadius, effRadius, currStickCoors.x+effRadius, currStickCoors.y+effRadius, effRadius);        
//       effArea.addColorStop(0, "#FFFFFF"); // light red
//       effArea.addColorStop(1, "#000000"); // dark red        
//       context.fillStyle = effArea;       
//       context.beginPath();      
//       context.arc(currStickCoors.x, currStickCoors.y, effRadius, Math.PI*2, 0, true);
//       context.closePath()
//       context.fill();
//     }
//   }
// };



/////////////// controller code ////////////////
// problem originally: effect functions were creating their own variable pressed and not manipulating the object level one. 


// effective region of stick is some radius around current position
function JoyStick(canvas, baseX, baseY){
  context = canvas.getContext("2d");
  this.baseStickCoors = {x: baseX, y: baseY};  
  this.currStickCoors = {x: baseX, y: baseY};
  this.effRadius = 10
  this.pressed = 0;


  // this.testfunc =  function(coors) {
  //   console.log(this);
  //   pressed = 1;
  //   console.log(this.pressed + " " + pressed);
  // };
  // var testfunc1 = function(coors) {
  //   console.log(this);
  //   console.log(this.pressed);
  //   this.pressed = 0;
  // };
  // function testfunc2(coors){
  //   console.log(this);
  //   console.log(this.pressed);
  //   this.pressed = 1;
  // };

  // this.test = {test: this.testfunc};
  // this.test1 = {test: testfunc1};
  // this.test2 = {test: testfunc2};

  // attempt to capture the 

  var press =  function(coors) {
    console.log("press: " + coors.x + "  " + coors.y + "   " + pressed);
    console.log(this);
    pressed = 1;
    console.log(pressed);
    currStickCoors = coors;
  };
  function unpress(coors) {
    console.log("unpress: " + coors.x + "  " + coors.y + "   " + pressed);
    pressed = 0;
    console.log(pressed);
    currStickCoors = baseStickCoors;
  };
  function updatePosition(coors){
    console.log("updatePosition: " + coors.x + "  " + coors.y);
    if(pressed == 1){
      currStickCoors = coors;
    }
  };

  // this.effect = { mousedown:  press,
  //            touchstart: press,
  //            mouseup:    unpress,
  //            touchend:   unpress,
  //            mousemove:  updatePosition,              
  //            touchmove:  updatePosition
  // };
};


JoyStick.prototype = {
  constructor: JoyStick,
  effect : {"mousedown":  __proto__.test,
           touchstart: __proto__.test,
           mouseup:  this.unpress,
           touchend:   this.unpress,
           mousemove:  this.updatePosition,              
           touchmove:  this.updatePosition
  },
  test: function(coors) {
    console.log("in hereerererere:");
  },
  effectedByGesture: function(coors) {
    // console.log("coors: ", coors);
    // console.log("stick: " + this.currStickCoors.x + ", " + this.currStickCoors.y);
    // console.log("dist: ", distance(stickPosX, coors.x, this.currStickCoors.y, coors.y), coors, this.currStickCoors.x + ", " + this.currStickCoors.y, (distance(stickPosX, coors.x, this.currStickCoors.y, coors.y) < this.effRadius));
    return distance(this.currStickCoors.x, coors.x, this.currStickCoors.y, coors.y) < this.effRadius;
  },
  draw: function(){
      context.clearRect(0,0,canvas.width,canvas.height); 
      //base of joystick
      var grd = context.createRadialGradient(this.baseStickCoors.x-25, this.baseStickCoors.y-25, 25, this.baseStickCoors.x+25, this.baseStickCoors.y+25, 25);
      grd.addColorStop(0, "#8ED6FF"); // light blue
      grd.addColorStop(1, "#004CB3"); // dark blue    

      context.fillStyle = grd;        
      context.beginPath();
      //draw arc: arc(x, y, radius, startAngle, endAngle, anticlockwise)
      context.arc(this.baseStickCoors.x, this.baseStickCoors.y, 25, Math.PI*2, 0, true);
      //end drawing
      context.closePath()
      //fill it so you could see it
      context.fill();

      //actual joystick
      var grd2 = context.createRadialGradient(this.currStickCoors.x-15, this.currStickCoors.y-15, 15, this.currStickCoors.x+15, this.currStickCoors.y+15, 15);        
      grd2.addColorStop(0, "#FF9999"); // light red
      grd2.addColorStop(1, "#990000"); // dark red        
      context.fillStyle = grd2;       
      context.beginPath();
      //draw arc: arc(x, y, radius, startAngle, endAngle, anticlockwise)
      context.arc(this.currStickCoors.x, this.currStickCoors.y, 15, Math.PI*2, 0, true);
      //end drawing
      context.closePath()
      //fill it so you could see it
      context.fill();


      // shoe effected area
      var effArea = context.createRadialGradient(this.currStickCoors.x-this.effRadius, this.currStickCoors.y-this.effRadius, this.effRadius, this.currStickCoors.x+this.effRadius, this.currStickCoors.y+this.effRadius, this.effRadius);        
      effArea.addColorStop(0, "#FFFFFF"); // light red
      effArea.addColorStop(1, "#000000"); // dark red        
      context.fillStyle = effArea;       
      context.beginPath();      
      context.arc(this.currStickCoors.x, this.currStickCoors.y, this.effRadius, Math.PI*2, 0, true);
      context.closePath()
      context.fill();
    }
};

// is this the object?
JoyStick.prototype.blah = 
function() {
  console.log("what is this: " + this.pressed, this);
  this.pressed = !this.pressed;
};
