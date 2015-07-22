/////////////// controller code ////////////////

// effective region of stick is some radius around current position
var joystick = function(canvas, baseX, baseY){
  var context = canvas.getContext("2d");
  var baseStickPosX = baseX;
  var stickPosX = baseX;
  var baseStickPosY = baseY;
  var stickPosY = baseY;
  var effRadius = 10
  var pressed = 0;

  function press(x,y) {
    console.log("press: " + x + "  " + y);
    pressed = 1;
    stickPosX = x;
    stickPosY = y;
  };
  function unpress(x,y) {
    console.log("unpress: " + x + "  " + y);
    pressed = 0;
    stickPosX = baseStickPosX;
    stickPosY = baseStickPosY;
  };
  function updatePosition(x,y){
    console.log("updatePosition: " + x + "  " + y);
    if(pressed == 1){
      stickPosX = x;
      stickPosY = y;
      console.log("x: " + stickPosX + ",  y: " + stickPosY);
    }
  };

  return{
    effect: {mousedown:  press,
             touchstart: press,
             mouseup:  unpress,
             touchend:   unpress,
             mousemove:  updatePosition,              
             touchmove:  updatePosition
           },
    effectedByGesture: function(coors) {
      // console.log("coors: ", coors);
      // console.log("stick: " + stickPosX + ", " + stickPosY);
      // console.log("dist: ", distance(stickPosX, coors.x, stickPosY, coors.y), coors, stickPosX + ", " + stickPosY, (distance(stickPosX, coors.x, stickPosY, coors.y) < effRadius));
      return distance(stickPosX, coors.x, stickPosY, coors.y) < effRadius;
    },
    draw: function(){
      context.clearRect(0,0,canvas.width,canvas.height); 
      //base of joystick
      var grd = context.createRadialGradient(baseStickPosX-25, baseStickPosY-25, 25, baseStickPosX+25, baseStickPosY+25, 25);
      grd.addColorStop(0, "#8ED6FF"); // light blue
      grd.addColorStop(1, "#004CB3"); // dark blue    

      context.fillStyle = grd;        
      context.beginPath();
      //draw arc: arc(x, y, radius, startAngle, endAngle, anticlockwise)
      context.arc(baseStickPosX, baseStickPosY, 25, Math.PI*2, 0, true);
      //end drawing
      context.closePath()
      //fill it so you could see it
      context.fill();

      //actual joystick
      console.log(stickPosX + " " + stickPosY);
      var grd2 = context.createRadialGradient(stickPosX-15, stickPosY-15, 15, stickPosX+15, stickPosY+15, 15);        
      grd2.addColorStop(0, "#FF9999"); // light red
      grd2.addColorStop(1, "#990000"); // dark red        
      context.fillStyle = grd2;       
      context.beginPath();
      //draw arc: arc(x, y, radius, startAngle, endAngle, anticlockwise)
      context.arc(stickPosX, stickPosY, 15, Math.PI*2, 0, true);
      //end drawing
      context.closePath()
      //fill it so you could see it
      context.fill();


      // shoe effected area
      var effArea = context.createRadialGradient(stickPosX-effRadius, stickPosY-effRadius, effRadius, stickPosX+effRadius, stickPosY+effRadius, effRadius);        
      effArea.addColorStop(0, "#FFFFFF"); // light red
      effArea.addColorStop(1, "#000000"); // dark red        
      context.fillStyle = effArea;       
      context.beginPath();      
      context.arc(stickPosX, stickPosY, effRadius, Math.PI*2, 0, true);
      context.closePath()
      context.fill();
    }
  }
};