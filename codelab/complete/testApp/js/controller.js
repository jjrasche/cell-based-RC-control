///////////////////// Declare Controller Objects ///////////////////////////////

// rc flying controller
var canvas = document.getElementById("canvasSignature");
var objects = {};
objects.rightStick = new JoyStick(canvas, 350, 300);//joystick(canvas, 350, 300);
//objects.leftStick = joystick(canvas, 150, 300);

function initialize(dataChannel) {
  // get references to the canvas element as well as the 2D drawing context
  // dataChannel.onmessage = controllerRecvMsg;

  drawController();

  var actions = {
    touchstart: function (coors, obj, event) {
      canvas.addEventListener('touchmove', move, false);
      obj.effect[event](coors);
      transmit(coors, event);
    },
    touchmove: function (coors, obj, event) {
      obj.effect[event](coors);
      transmit(coors, event);
    },
    touchend: function (coors, obj, event) {
      obj.effect[event](coors);
      transmit(coors, event);
      canvas.removeEventListener('touchmove', move, false);
    },

    mousedown: function (coors, obj, event) {
      //canvas.addEventListener('mousemove', move, false);
      //obj.blah();
      console.log(obj.effect, event);
      console.log(obj.effect[event]);
      obj.effect[event](coors);
      transmit(coors, event);
    },
    mousemove: function (coors, obj, event) {
      obj.effect[event](coors);
      transmit(coors, event);
    },
    mouseup: function (coors, obj, event) {
      obj.effect[event](coors);
      console.log("lasjfljdflskjdf");
      transmit(coors, event);
      canvas.removeEventListener('mousemove', move, false);
    }
  };

  function transmit(coors, type) {
  	var msg = {'type': type, 'coors': coors};
    commOut.innerHTML = JSON.stringify(msg);
    // dataChannel.send(JSON.stringify(obj));
  }

  function drawController() {
  	for (var key in objects) {
  		objects[key].draw();
  	}
  }

  // return any objects that are newly effected, or currently pressed
  function getEffectedObject(coors) {
  	var obj = null;
  	for (var key in objects) {
      console.log("getEffectedObject: ", objects[key]);
  		if (objects[key].effectedByGesture(coors) || objects[key].pressed) {
  			if (obj != null) throw "multiple effected objects";
  			obj = objects[key];

  			console.log(key + " effected: " + objects[key].effectedByGesture(coors) + " " + objects[key].pressed + " " + obj);
  		}
  	}
  	return obj;
  }

	function controllerRecvMsg(event) {
		var msg = JSON.parse(event.data);
		var coors = msg.coors;
		commIn.innerHTML = "(" + coors.x + ", " + coors.y + ")";
		console.log('Received message: ', msg);
		obj[type](msg.coors);
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

    var obj = getEffectedObject(coors);
    console.log(event.type, obj);
    if (obj != null) {
      //console.log(obj);
	    actions[event.type](coors, obj, event.type);
	    drawController();
	   }
  }


  // canvas.addEventListener('touchstart', move, false);
  // canvas.addEventListener('touchend', move, false);
  canvas.addEventListener('mousedown', move, false);
  // canvas.addEventListener('mouseup', move, false);

  // prevent elastic scrolling
  canvas.addEventListener('touchmove',function (event) {event.preventDefault();},false); 
}