
/////////////// JoyStick  ////////////////

function JoyStick(canvas, baseX, baseY){
  var context = canvas.getContext("2d");
  var baseStickCoors = {x: baseX, y: baseY};  
  var currStickCoors = {x: baseX, y: baseY};
  var effRadius = 10
  var focusedOn = false;

  var press =  function(coors) {
    console.log("press: " + coors.x + "  " + coors.y + "   " + focusedOn);
    console.log(this);
    focusedOn = true;
    console.log(focusedOn);
    currStickCoors = coors;
  };
  function unpress(coors) {
    console.log("unpress: " + coors.x + "  " + coors.y + "   " + focusedOn);
    focusedOn = false;
    console.log(focusedOn);
    currStickCoors = baseStickCoors;
  };
  function updatePosition(coors){
    console.log("updatePosition: " + coors.x + "  " + coors.y + "    " + focusedOn);
    if(focusedOn){
      currStickCoors = coors;
    }
  };

  this.isFocusedOn = function() {
    return focusedOn;
  };

  this.draw = function(){
    //base of joystick
    var grd = context.createRadialGradient(baseStickCoors.x-25, baseStickCoors.y-25, 25, baseStickCoors.x+25, baseStickCoors.y+25, 25);
    grd.addColorStop(0, "#8ED6FF"); // light blue
    grd.addColorStop(1, "#004CB3"); // dark blue    

    context.fillStyle = grd;        
    context.beginPath();
    //draw arc: arc(x, y, radius, startAngle, endAngle, anticlockwise)
    context.arc(baseStickCoors.x, baseStickCoors.y, 25, Math.PI*2, 0, true);
    //end drawing
    context.closePath()
    //fill it so you could see it
    context.fill();

    //actual joystick
    var grd2 = context.createRadialGradient(currStickCoors.x-15, currStickCoors.y-15, 15, currStickCoors.x+15, currStickCoors.y+15, 15);        
    grd2.addColorStop(0, "#FF9999"); // light red
    grd2.addColorStop(1, "#990000"); // dark red        
    context.fillStyle = grd2;       
    context.beginPath();
    //draw arc: arc(x, y, radius, startAngle, endAngle, anticlockwise)
    context.arc(currStickCoors.x, currStickCoors.y, 15, Math.PI*2, 0, true);
    //end drawing
    context.closePath()
    //fill it so you could see it
    context.fill();


    // shoe effected area
    var effArea = context.createRadialGradient(currStickCoors.x-effRadius, currStickCoors.y-effRadius, effRadius, currStickCoors.x+effRadius, currStickCoors.y+effRadius, effRadius);        
    effArea.addColorStop(0, "#FFFFFF"); // light red
    effArea.addColorStop(1, "#000000"); // dark red        
    context.fillStyle = effArea;       
    context.beginPath();      
    context.arc(currStickCoors.x, currStickCoors.y, effRadius, Math.PI*2, 0, true);
    context.closePath()
    context.fill();
  };

  this.effectedByGesture = function(coors) {
    // console.log("coors: ", coors);
    // console.log("stick: " + currStickCoors.x + ", " + currStickCoors.y);
    // console.log("dist: ", distance(stickPosX, coors.x, currStickCoors.y, coors.y), coors, currStickCoors.x + ", " + currStickCoors.y, (distance(stickPosX, coors.x, currStickCoors.y, coors.y) < effRadius));
    return distance(currStickCoors.x, coors.x, currStickCoors.y, coors.y) < effRadius;
  };

  this.effect = {  mousedown:  press,
                   touchstart: press,
                   mouseup:    unpress,
                   touchend:   unpress,
                   mousemove:  updatePosition,              
                   touchmove:  updatePosition
  };
};


JoyStick.prototype = {
  constructor: JoyStick,
};
