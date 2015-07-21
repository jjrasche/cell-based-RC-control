///////////////////// Declare Controller Objects ///////////////////////////////

// rc flying controller
var canvas = document.getElementById("canvasSignature");
var objects = {};
objects.rightStick = joystick(canvas, 350, 300);
objects.leftStick = joystick(canvas, 150, 300);

function initialize() {
  // get references to the canvas element as well as the 2D drawing context
  drawController();

  var actions = {
    touchstart: function (coors, obj) {
      canvas.addEventListener('touchmove', move, false);
      obj.press(coors.x,coors.y);
    },
    touchmove: function (coors, obj) {
       obj.updatePosition(coors.x,coors.y);
    },
    touchend: function (coors, obj) {
      obj.unpress();
      canvas.removeEventListener('touchmove', move, false);
    },

    mousedown: function (coors, obj) {
      canvas.addEventListener('mousemove', move, false);
      obj.press(coors.x,coors.y);
      coors.action = "down";
      transmit(coors);
    },
    mousemove: function (coors, obj) {
      obj.updatePosition(coors.x,coors.y);
      coors.action = "move";
      transmit(coors);
    },
    mouseup: function (coors, obj) {
      obj.unpress();
      canvas.removeEventListener('mousemove', move, false);
      coors.action = "up";
      transmit(coors);
    }
  };

  function transmit(obj) {
    commOut.innerHTML = JSON.stringify(obj);
    sendChannel.send(JSON.stringify(obj));
  }

  function drawController() {
  	for (var key in objects) {
  		objects[key].draw();
  	}
  }

  function getEffectedObject(x, y) {
  	var obj = null
  	for (var key in objects) {
  		if (objects[key].effectedByGesture()) {
  			if (obj != null) throw "multiple effected objects";
  			obj = objects[key];
  			console.log(key + " effected by gesture");
  		}
  	}
  	return obj;
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
    // figure out what object to effect
    var obj = getEffectedObject(x, y);

    actions[event.type](coors, obj);
  }


  canvas.addEventListener('touchstart', move, false);
  canvas.addEventListener('touchend', move, false);
  canvas.addEventListener('mousedown', move, false);
  canvas.addEventListener('mouseup', move, false);

  // prevent elastic scrolling
  canvas.addEventListener('touchmove',function (event) {event.preventDefault();},false); 
}


$(document).ready(function () {
  initialize();
  // for (var key in objects) {
  // 	console.log(key);
  // 	console.log(objects[key]);
  // }
});
