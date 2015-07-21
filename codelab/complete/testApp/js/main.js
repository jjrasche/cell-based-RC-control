'use strict';

/*
  questions:
    - where is code for webkitRTCPeerConnection or moz ??
    - where does the ice creation and stun/turn request happen ??
    - how does  io.connect() know what server to connect its websocket to ??

  sdp = agreement on what standards, codecs, resolution ... to use in communication
  ice = how to traverse the network to communicate with peer
  
  chronology:
    Initiator                         2nd peer
      create room
      setup local stream
                                        join room
                                        setup local stream
      create peerConnection             create peerConnection
      send ice candidates               send ice candidates
      get remote ice candidates         get remote ice candidates
      set local sdp
      send sdp offer
                                        set remote sdp
                                        set local sdp
                                        send answer
      set remote sdp
*/
var isChannelReady;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;
var offerOrAnswer = "";
var pressed = 0;

var sendChannel;
var commOut = document.getElementById("commandOut");
var commIn = document.getElementById("commandIn");

console.log("out: ", commOut);
console.log("in: ", commIn);

var pc_config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {'mandatory': {
  'OfferToReceiveAudio':true,
  'OfferToReceiveVideo':true }};

/////////////////////////////////////////////

var room = location.pathname.substring(1);
if (room === '') {
//  room = prompt('Enter room name:');
  room = 'foo';
} else {
  //
}


var socket = io.connect();

// request to join a room
if (room !== '') {

  socket.emit('create or join', room);        // ?? how does it know what to connect to ??
}

// listen for responses from server 
socket.on('created', function (room){   // you are first in room
  console.log('Created room ' + room);
  isInitiator = true;
});
socket.on('full', function (room){    // more than 2 people in room
  console.log('Room ' + room + ' is full');
});
socket.on('join', function (room){    // a 2nd person joined the room you created
  console.log('Another peer made a request to join room ' + room);
  isChannelReady = true;
});
socket.on('joined', function (room){  // you are 2nd person in room
  console.log('joined room ' + room);
  isChannelReady = true;
});
socket.on('log', function (array){
  //console.log.apply(console, array);
});

////////////////////////////////////////////////

// broadcast message to room members
function sendMessage(message){
  console.log('Client sending message: ', message);
  if (message.type == "candidate") {
    message.from = isInitiator ? "1" : "2";
  }
  socket.emit('message', message);
}

socket.on('message', function (message){
  //console.log('Client received message:', message);
  // message received wwhen either client initializes media
  // so even the last person to join will setup connection 
  if (message === 'got user media') {
    attemptConnection();
  } 
  //received an sdp offer from other client
  else if (message.type === 'offer') {
    if (!isInitiator && !isStarted) {
      attemptConnection();
    }
    var sessDesc = new RTCSessionDescription(message);
    pc.setRemoteDescription(sessDesc);
    console.log("(OFFER) setting remote description", sessDesc);
    answer();
  } 
  // 
  else if (message.type === 'answer' && isStarted) {
    var sessDesc = new RTCSessionDescription(message);
    pc.setRemoteDescription(sessDesc);
    console.log("(ANSWER) setting remote description", sessDesc);
  } 
  // if being sent a candidate add it to peerConnection
  // there is nothing preventing an instance from receiving its own candidate ??
  else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
    console.log("adding candidate from " + message.from + ":  ", candidate)
  } 
  else if (message === 'bye' && isStarted) {
    handleRemoteHangup();
  }
});

////////////////////////////////////////////////////

// initialize local objects
function handleUserMedia(stream) {
  console.log('setting up local stream');
  localVideo.src = window.URL.createObjectURL(stream);
  localStream = stream;
  //if the 2nd person in room, alert creator 
  if (isInitiator) {
    attemptConnection();
  }
}

function handleUserMediaError(error){
  console.log('getUserMedia error: ', error);
}

var constraints = {video: true, audio: true};
sendMessage('got user media');
//getUserMedia(constraints, handleUserMedia, handleUserMediaError);
if (location.hostname != "localhost") {
  requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
}

/*
  before creating peer connection must: 
    1) (!isStarted) not have created one before
    2) (ocalStream != 'undefined') localStream has been initialized by getUserMedia()
    3) (isChannelReady) two people are in stream 
*/
function attemptConnection() {
  console.log("attemptConnection: " + (!isStarted && isChannelReady)
              + ",   !isStarted: " + (!isStarted) 
              + ",    isChannelReady: " + (isChannelReady));
  if (!isStarted && isChannelReady) {
    createPeerConnection();
    // pc.addStream(localStream);
    console.log("add local stream");
    isStarted = true;
    // first person in channel is initiator
    if (isInitiator) {
      call();
    }
  }
}

window.onbeforeunload = function(e){
  sendMessage('bye');
}

/////////////////////////////////////////////////////////
$(document).ready(function () {
  initialize(sendChannel);
});
// the contstructor prototype must request ICE candidate and call oncandidate func
function createPeerConnection() {
  try {
    /*XXX*/pc = new RTCPeerConnection(null);
    //  onicecandidate returns locally generated ICE candidates to be passed to peers
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
      return;
  }

  if (isInitiator) {
    try {
      sendChannel = pc.createDataChannel("sendDataChannel", {reliable: false});
      initialize(sendChannel);
      console.log('Created send data channel');
    } catch (e) {
      alert('Failed to create data channel. ' +
            'You need Chrome M25 or later with RtpDataChannel enabled');
      trace('createDataChannel() failed with exception: ' + e.message);
    }
    sendChannel.onopen = null;
    sendChannel.onclose = null;
  } else {
    pc.ondatachannel = gotReceiveChannel;
  }
}

// send results from stun servers (ipv4/ipv6, UDP random addresses)
function handleIceCandidate(event) {
  // console.log('handleIceCandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate});
  } else {
    console.log('End of candidates.');
  }
}

function sendData() {
  var data = sendTextarea.value;
  sendChannel.send(data);
  console.log('Sent data: ' + data);
}

function gotReceiveChannel(event) {
  trace('Receive Channel Callback');
  sendChannel = event.channel;
  sendChannel.onmessage = handleMessage;
  sendChannel.onopen = null;
  sendChannel.onclose = null;
}

// function handleMessage(event) {
//   var obj = JSON.parse(event.data);
//   commIn.innerHTML = "(" + obj.x + ", " + obj.y + ")";
//   console.log('Received message: ', obj);
//   if (obj.action == "up")
//     pressed = 0;
//   else if (obj.action == "down")
//     pressed = 1;
//   else if (obj.action == "move")
//     stick.updatePosition(obj.x,obj.y);
//   else 
//     throw "invalid action";
// }

function handleSendChannelStateChange() {
  var readyState = sendChannel.readyState;
  trace('Send channel state is: ' + readyState);
  enableMessageInterface(readyState == "open");
}

function handleReceiveChannelStateChange() {
  var readyState = sendChannel.readyState;
  trace('Receive channel state is: ' + readyState);
  enableMessageInterface(readyState == "open");
}

function enableMessageInterface(shouldEnable) {
    if (shouldEnable) {
    dataChannelSend.disabled = false;
    dataChannelSend.focus();
    dataChannelSend.placeholder = "";
    sendButton.disabled = false;
  } else {
    dataChannelSend.disabled = true;
    sendButton.disabled = true;
  }
}


// called when a remote connection has added a stream to peerConnection
function handleRemoteStreamAdded(event) {
  console.log('Remote stream added');
  remoteVideo.src = window.URL.createObjectURL(event.stream);
  remoteStream = event.stream;
}

// called when a remote connection has remove a stream to peerConnection
function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

function handleCreateOfferError(event){
  console.log('createOffer() error: ', e);
}

function call() {
  offerOrAnswer = "offer";
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function answer() {
  offerOrAnswer = "answer";
  pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints);
}

function setLocalAndSendMessage(sessionDescription) {
  //sessionDescription.sdp = preferOpus(sessionDescription.sdp);
  pc.setLocalDescription(sessionDescription);
  console.log('setLocal and sending ' + offerOrAnswer , sessionDescription);
  sendMessage(sessionDescription);
}

//
function requestTurn(turn_url) {
  var turnExists = false;
  for (var i in pc_config.iceServers) {
    if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    console.log('Getting TURN server from ', turn_url);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText);
        console.log('Got TURN server: ', turnServer);
        pc_config.iceServers.push({
          'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
          'credential': turnServer.password
        });
        turnReady = true;
      }
    };
    xhr.open('GET', turn_url, true);
    xhr.send();
  }
}

function hangup() {
  console.log('Hanging up.');
  stop();
  sendMessage('bye');
}

function handleRemoteHangup() {
//  console.log('Session terminated.');
  // stop();
  // isInitiator = false;
}

function stop() {
  isStarted = false;
  // isAudioMuted = false;
  // isVideoMuted = false;
  pc.close();
  pc = null;
}

///////////////////////////////////////////

// Set Opus as the default audio codec if it's present.
function preferOpus(sdp) {
  //console.log("preferOpus:\n" + sdp);
  var sdpLines = sdp.split('\r\n');
  var mLineIndex;
  // Search for m line.
  for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].search('m=audio') !== -1) {
        mLineIndex = i;
        break;
      }
  }
  if (mLineIndex === null) {
    return sdp;
  }

  // If Opus is available, set it as the default in m line.
  for (i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search('opus/48000') !== -1) {
      var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
      if (opusPayload) {
        sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
      }
      break;
    }
  }

  // Remove CN in m line and sdp.
  sdpLines = removeCN(sdpLines, mLineIndex);

  sdp = sdpLines.join('\r\n');
  return sdp;
}

function extractSdp(sdpLine, pattern) {
  var result = sdpLine.match(pattern);
  return result && result.length === 2 ? result[1] : null;
}

// Set the selected codec to the first in m line.
function setDefaultCodec(mLine, payload) {
  var elements = mLine.split(' ');
  var newLine = [];
  var index = 0;
  for (var i = 0; i < elements.length; i++) {
    if (index === 3) { // Format of media starts from the fourth.
      newLine[index++] = payload; // Put target payload to the first.
    }
    if (elements[i] !== payload) {
      newLine[index++] = elements[i];
    }
  }
  return newLine.join(' ');
}

// Strip CN from sdp before CN constraints is ready.
function removeCN(sdpLines, mLineIndex) {

  var mLineElements = sdpLines[mLineIndex].split(' ');
  // Scan from end for the convenience of removing an item.
  for (var i = sdpLines.length-1; i >= 0; i--) {
    var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
    if (payload) {
      var cnPos = mLineElements.indexOf(payload);
      if (cnPos !== -1) {
        // Remove CN payload from m line.
        mLineElements.splice(cnPos, 1);
      }
      // Remove CN line in sdp
      sdpLines.splice(i, 1);
    }
  }

  sdpLines[mLineIndex] = mLineElements.join(' ');
  return sdpLines;
}
