/////////////// controller code ////////////////

// effective region of stick is some radius around current position
var joystick = function(canvas, baseX, baseY){
  var context = canvas.getContext("2d");
  var baseStickPosX = 250;
  var stickPosX = 250;
  var baseStickPosY = 250;
  var stickPosY = 250;
  var effRadius = 5
  var pressed = 0;

  function press(x,y) {
    pressed = 1;
    stickPosX = x;
    stickPosY = y;
    this.draw();
  };
  function unpress(x,y) {
    pressed = 0;
    stickPosX = baseStickPosX;
    stickPosY = baseStickPosY;
    this.draw();
  };
  function updatePosition(x,y){
    if(pressed == 1){
      stickPosX = x;
      stickPosY = y;
      this.draw();
    }
  };

  return{
    effect: {mousedown:  press,
             touchstart: press,
             mousedown:  unpress,
             touchend:   unpress,
             mousemove:  updatePosition,              
             touchmove:  updatePosition
           },
    effectedByGesture: function(x,y) {
      return distance(stickPosX, x, stickPosY, y) < effRadius;
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
      //console.log(stickPosX + " " + stickPosY);
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
    }
  }
};