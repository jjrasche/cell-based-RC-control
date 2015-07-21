/////////////// controller code ////////////////

// effective region of stick is some radius around current position
var joystick = function(canvas, baseX, baseY){
  var context = canvas.getContext("2d");
  var baseStickPosX = 250;
  var stickPosX = 250;
  var baseStickPosY = 250;
  var stickPosY = 250;
  var effRadius = 5

  return{
    press: function(x,y){
      pressed = 1;
      stickPosX = x;
      stickPosY = y;
      this.draw();
    },
    unpress: function(){
      pressed = 0;
      stickPosX = baseStickPosX;
      stickPosY = baseStickPosY;
      this.draw();
    },
    updatePosition: function(x,y){
      console.log("updatePosition:  (" + x + ", " + y + ")");
      if(pressed == 1){
        stickPosX = x;
        stickPosY = y;
        this.draw();
      }
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

$(document).ready(function () {
  console.log()
  //stick.draw(document.getElementById("canvasSignature").getContext("2d"));
  initialize();
});

function initialize() {
  // get references to the canvas element as well as the 2D drawing context
  stick.draw();

  var actions = {
    touchstart: function (coors) {
      canvas.addEventListener('touchmove', move, false);
      stick.press(coors.x,coors.y);
    },
    touchmove: function (coors) {
        stick.updatePosition(coors.x,coors.y);
    },
    touchend: function (coors) {
      stick.unpress();
      canvas.removeEventListener('touchmove', move, false);
    },

    mousedown: function (coors) {
      canvas.addEventListener('mousemove', move, false);
      stick.press(coors.x,coors.y);
      coors.action = "down";
      transmit(coors);
    },
    mousemove: function (coors) {
      stick.updatePosition(coors.x,coors.y);
      coors.action = "move";
      transmit(coors);
    },
    mouseup: function (coors) {
      stick.unpress();
      canvas.removeEventListener('mousemove', move, false);
      coors.action = "up";
      transmit(coors);
    }
  };

  function transmit(obj) {
    commOut.innerHTML = JSON.stringify(obj);
    sendChannel.send(JSON.stringify(obj));

  }

  // create a function to pass touch events and coordinates to drawer
  function move(event) {
    var coors = {};
    if (event.targetTouches != null) {
      coors = {
        x: event.targetTouches[0].pageX - canvas.offsetLeft,
        y: event.targetTouches[0].pageY - canvas.offsetTop
      };
    }
    else {
      coors = {
        x: event.pageX - canvas.offsetLeft,
        y: event.pageY - canvas.offsetTop
      };
    }
    actions[event.type](coors);
  }

  canvas.addEventListener('touchstart', move, false);
  canvas.addEventListener('touchend', move, false);
  canvas.addEventListener('mousedown', move, false);
  canvas.addEventListener('mouseup', move, false);

  // prevent elastic scrolling
  canvas.addEventListener('touchmove',function (event) {event.preventDefault();},false); 
}