Tests = new Mongo.Collection("tests");

if (Meteor.isClient) {
  name = getRandomNumber();
  Meteor.subscribe("tests");
  Session.set('avgTimes', {srt : 0, crt : 0});  
  Session.set('lastSendTime', "");
  Session.set('lastReceiveTime', "");

  Template.tests.helpers({
    Tests: function () {
      var ret = Tests.find().fetch();
      return(ret);
    },
    average : function() {
      var avg = Session.get('avgTimes');
      return("srt: " + avg.srt + "   crt: " + avg.crt);      
    },
    lastSendTime : function() {
      return Session.get('lastSendTime');
    },
    lastReceiveTime : function() {
      return Session.get('lastReceiveTime');
    },
  });
  Template.tests.events({
    "click #getAvg" : function(event) {
      var tests = Tests.find().fetch();
      var totalSRT = 0;
      var totalCRT = 0;
      for (t in tests) {
        totalSRT += (tests[t].serverRecvTime - tests[t].SendTime)/1000;
        totalCRT += (tests[t].clientRecvTime - tests[t].SendTime)/1000;
      }
      console.log(totalSRT + "  " + tests.length + "  " + totalSRT/tests.length);
      Session.set('avgTimes', {srt : totalSRT/tests.length, crt : totalCRT/tests.length});
    },
    "click #reset" : function(event) {
      Meteor.call("RemoveAllTests");
    },
    "click #addTest" : function(event) {    
      var dt = new Date()   
      Session.set('lastSendTime', timeToString(dt));
      Meteor.call("AddTest", dt.getTime());

    },
  });


  Template.test.helpers({
    getTime: function(st, srt, crt, id, number) {
      var _crt = new Date();
      // if client recv time already set, use it. otherwise, set it.
      if (crt != null) {
        _crt = new Date(crt);
      }
      if (crt == null) {
        Meteor.call("SetCRT", id, _crt, name, function(error, result) {
          if (result) {
            console.log("set crt");
            Session.set('lastReceiveTime', timeToString(_crt));
          } else {
            console.log("NOT set crt");
          }
        })
      }
      _st = new Date(st);
      _srt = new Date(srt);

      var ret = "st: " + timeToString(_st);
      ret += " sr: " + timeToString(_srt);
      ret += " cr: " + timeToString(_crt);
      ret += "    tts: " + (srt - st)/1000;
      ret += "    ttc: " + (crt- st)/1000;
      ret += " " + number;

      return ret;
    }
  });
}

function timeToString(dt) {
  ret = dt.getMinutes() + ":";
  ret += dt.getSeconds() + ":";
  ret += dt.getMilliseconds();
  return ret;
}

function getRandomNumber() {
  return Math.floor(Math.random() * 100) + 0;
}

if (Meteor.isServer) {
  Meteor.publish("tests", function(filter) {
    var self = this;
    var subHandle = Tests.find(filter || {}).observeChanges({
      added: function (id, fields) {
        self.added("tests", id, fields);
      },
      changed: function(id, fields) {
        self.changed("tests", id, fields);
      },
      removed: function (id) {
        self.removed("tests", id);
      }
    });
    self.ready();
    self.onStop(function () {
      subHandle.stop();
    });
  });

  Meteor.methods({  
    AddTest: function(sendTime){
      if (Meteor.isServer) {
        var srt = new Date();
        var testObj = {SendTime : sendTime, serverRecvTime : srt.getTime()};
        Tests.insert(testObj);
      }
    },
    RemoveAllTests : function() {
      Tests.remove({});
    },
    SetCRT : function(id, crt, name) {
      if (Meteor.isServer) {
        var test = Tests.findOne({_id : id});
        var update = {};
        update["name"] = name;
        update["clientRecvTime"] = crt.getTime();
        console.log(update);
        if (test.clientRecvTime == null) {
          Tests.update(id, { $set: update });
          return (true);
        }
        return (false);
      }
    }
  });
}

if (Meteor.isClient) {
  var pressed = 0; //boolean
  var reset = false;

  var joystick = function(){
    var tempScreenPositionX = 250;
    var tempDragPositionX = 250;
    var tempScreenPositionY = 250;
    var tempDragPositionY = 250;
    var stickLength = 10; 
    var box = [0,0,0,0]; //upper left corner coords and lower right coords in which the box joystick can be used
    
    return{
      setStickLength: function(pLength){
        stickLength = pLength;
      },    
      setBox: function(pX1,pY1,pX2,pY2){
        box = [pX1,pY1,pX2,pY2];
      },
      getValue: function(){
        if(pressed == 1){
          var length = Math.sqrt(Math.pow((tempDragPositionX - tempScreenPositionX),2)+Math.pow((tempDragPositionY - tempScreenPositionY),2));
          if (length > stickLength){
            length = stickLength;
          }
          var power = (length/stickLength);     
          var radians = Math.atan2((tempDragPositionX - tempScreenPositionX), (tempDragPositionY - tempScreenPositionY));
          return [power,radians];
        }else{
          return [0,0];
        }
      },
      press: function(x,y){
        if(x>box[0] && x<box[2]){
          if(y>box[1] && y<box[3]){
            pressed = 1;
            // tempScreenPositionX = x;
            // tempScreenPositionY = y;
            tempDragPositionX = x;
            tempDragPositionY = y;
          }
        }
      },
      unpress: function(){
        pressed = 0;
        tempDragPositionX = tempScreenPositionX;
        tempDragPositionY = tempScreenPositionY;
        reset = true;
      },
      updatePosition: function(x,y){
        if(pressed == 1){
          tempDragPositionX = x;
          tempDragPositionY = y;
        }
      },
      draw: function(context){
        if (true) { //pressed == 1){  
          //base of joystick
          var grd = context.createRadialGradient(tempScreenPositionX-25, tempScreenPositionY-25, 25, tempScreenPositionX+25, tempScreenPositionY+25, 25);
          grd.addColorStop(0, "#8ED6FF"); // light blue
            grd.addColorStop(1, "#004CB3"); // dark blue    
                
          context.fillStyle = grd;        
          context.beginPath();
          //draw arc: arc(x, y, radius, startAngle, endAngle, anticlockwise)
          context.arc(tempScreenPositionX, tempScreenPositionY, 25, Math.PI*2, 0, true);
          //end drawing
          context.closePath()
          //fill it so you could see it
          context.fill();
    
          //actual joystick
          var grd2 = context.createRadialGradient(tempDragPositionX-15, tempDragPositionY-15, 15, tempDragPositionX+15, tempDragPositionY+15, 15);        
          grd2.addColorStop(0, "#FF9999"); // light red
            grd2.addColorStop(1, "#990000"); // dark red        
          context.fillStyle = grd2;       
          context.beginPath();
          //draw arc: arc(x, y, radius, startAngle, endAngle, anticlockwise)
          context.arc(tempDragPositionX, tempDragPositionY, 15, Math.PI*2, 0, true);
          //end drawing
          context.closePath()
          //fill it so you could see it
          context.fill();
        } 
      }
    }
  };
  var stick = joystick();
  mouseDown = function(event){
    console.log(event);
    stick.press(event.pageX, event.pageY);
    canvas.addEventListener("mousemove", mouseMove, false);
  };
  mouseUp = function(event){
    stick.unpress();
    canvas.removeEventListener("mousemove", mouseMove, false);
  };
  mouseMove = function(event){
    event.preventDefault();
    stick.press();
    stick.updatePosition(event.pageX,event.pageY);
  };

  touchDown = function(event){
    stick.press(event.pageX, event.pageY);
    canvas.addEventListener("touchmove", touchMove, false);
  };
  touchUp = function(event){
    stick.unpress();
    canvas.removeEventListener("touchmove", touchMove, false);
  };
  touchMove = function(event){
    event.preventDefault();
    stick.press();
    stick.updatePosition(event.pageX,event.pageY);
  };

  // initialize
  // $(function(){
  //   console.log(stick);
  //   stick.draw(document.getElementById('canvas').getContext('2d'));

  //   canvas.addEventListener("mousedown", mouseDown, false);
  //   canvas.addEventListener("mouseup", mouseUp, false);

  // });

  // $(function(){
  //   var canvas = document.getElementById('canvas');
  //   canvas.width = 1000;
  //   canvas.height = 1000;
  //   var ctx = canvas.getContext('2d');
  //   stick.setBox(0,0,1000,1000);
  //   stick.setStickLength(25);

  //   canvas.addEventListener("mousedown", mouseDown, false);
  //   canvas.addEventListener("mouseup", mouseUp, false);

  //   canvas.addEventListener("touchstart", touchDown, false);
  //   canvas.addEventListener("touchend", touchUp, false);


  //   setInterval(function(){
  //     if (pressed || reset) {
  //       ctx.clearRect(0,0,canvas.width,canvas.height); 
  //       stick.draw(ctx);
  //       console.log(stick.getValue());
  //       reset = false;
  //     }
  //     /*
  //      * stick.getValue() 
  //      * returns [power, radians]
  //      */
  //   },100)

  // })
}

