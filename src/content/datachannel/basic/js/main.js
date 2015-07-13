/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

var localConnection;
var remoteConnection;
var sendChannel;
var receiveChannel;
var pcConstraint;
var dataConstraint;
var dataChannelSend = document.querySelector('textarea#dataChannelSend');
var dataChannelReceive = document.querySelector('textarea#dataChannelReceive');
var startButton = document.querySelector('button#startButton');
var sendButton = document.querySelector('button#sendButton');
var closeButton = document.querySelector('button#closeButton');

startButton.onclick = createConnection;
sendButton.onclick = sendData;
closeButton.onclick = closeDataChannels;

function enableStartButton() {
  startButton.disabled = false;
}

function disableSendButton() {
  sendButton.disabled = true;
}

/*
detail:

1) Alice creates an RTCPeerConnection object.
2) Alice creates an offer (an SDP session description) with the RTCPeerConnection createOffer() method.
3) Alice calls setLocalDescription() with her offer.
4) Alice stringifies the offer and uses a signaling mechanism to send it to Eve.

5) Eve calls setRemoteDescription() with Alice's offer, so that her RTCPeerConnection knows about Alice's setup.
6) Eve calls createAnswer(), and the success callback for this is passed a local session description: Eve's answer.
7) Eve sets her answer as the local description by calling setLocalDescription().
8) Eve then uses the signaling mechanism to send her stringified answer back to Alice.
9) Alice sets Eve's answer as the remote session description using setRemoteDescription().

Exchange network info
1) Alice creates an RTCPeerConnection object with an onicecandidate handler.
2) The handler is called when network candidates become available.
3) In the handler, Alice sends stringified candidate data to Eve, via their signaling channel.
4) When Eve gets a candidate message from Alice, she calls addIceCandidate(), to add the candidate to the remote peer description.
*/

function createConnection() {
  var pc_config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {'mandatory': {
  'OfferToReceiveAudio':true,
  'OfferToReceiveVideo':true }};
  
  dataChannelSend.placeholder = '';
  var servers = null;//{'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};
  pcConstraint = null;//{'optional': [{'DtlsSrtpKeyAgreement': true}]};
  dataConstraint =  null;//{reliable: false};
  trace('Using SCTP based data channels');
  // SCTP is supported from Chrome 31 and is supported in FF.
  // No need to pass DTLS constraint as it is on by default in Chrome 31.
  // For SCTP, reliable and ordered is true by default.
  // Add localConnection to global scope to make it visible from the browser console.
  //  1) Alice creates an RTCPeerConnection object.
  window.localConnection = localConnection =
      new RTCPeerConnection(servers, pcConstraint);
  trace('Created local peer connection object localConnection');

  sendChannel = localConnection.createDataChannel('sendDataChannel',
      dataConstraint);
  trace('Created send data channel');

  localConnection.onicecandidate = iceCallback1;
  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;

  // Add remoteConnection to global scope to make it visible from the browser console.
  window.remoteConnection = remoteConnection =
      new RTCPeerConnection(servers, pcConstraint);
  trace('Created remote peer connection object remoteConnection');

  remoteConnection.onicecandidate = iceCallback2;
  remoteConnection.ondatachannel = receiveChannelCallback;
/*
void createOffer(RTCSessionDescriptionCallback successCallback, 
                 RTCPeerConnectionErrorCallback failureCallback, 
                 optional MediaConstraints constraints);
*/
  //  2) Alice creates an offer (an SDP session description) with the RTCPeerConnection createOffer() method.
  localConnection.createOffer(gotDescription1, onCreateSessionDescriptionError);
  startButton.disabled = true;
  closeButton.disabled = false;
}

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function sendData() {
  var data = dataChannelSend.value;
  sendChannel.send(data);
  trace('Sent Data: ' + data);
}

function closeDataChannels() {
  trace('Closing data channels');
  sendChannel.close();
  trace('Closed data channel with label: ' + sendChannel.label);
  receiveChannel.close();
  trace('Closed data channel with label: ' + receiveChannel.label);
  localConnection.close();
  remoteConnection.close();
  localConnection = null;
  remoteConnection = null;
  trace('Closed peer connections');
  startButton.disabled = false;
  sendButton.disabled = true;
  closeButton.disabled = true;
  dataChannelSend.value = '';
  dataChannelReceive.value = '';
  dataChannelSend.disabled = true;
  disableSendButton();
  enableStartButton();
}

// callback called by createoffer() with offer (SDP)
function gotDescription1(desc) {
  //  3) Alice calls setLocalDescription() with her offer.
  localConnection.setLocalDescription(desc);
  trace('Offer from localConnection \n' + desc.sdp);
  trace(' is the offer stringified? ');
  console.log(desc);
  console.log(desc.toJSON());
  //  4) Alice stringifies the offer and uses a signaling mechanism to send it to Eve.
  /*
    This is where you woudld contact the signaling server with the requested room number.
    and offer 
  */
  remoteConnection.setRemoteDescription(desc);
  remoteConnection.createAnswer(gotDescription2,
      onCreateSessionDescriptionError);
}

function gotDescription2(desc) {
  remoteConnection.setLocalDescription(desc);
  trace('Answer from remoteConnection \n' + desc.sdp);
  localConnection.setRemoteDescription(desc);
}

function iceCallback1(event) {
  trace('local ice callback');
  if (event.candidate) {
    remoteConnection.addIceCandidate(event.candidate,
        onAddIceCandidateSuccess, onAddIceCandidateError);
    trace('Local ICE candidate: \n' + event.candidate.candidate);
  }
}

function iceCallback2(event) {
  trace('remote ice callback');
  if (event.candidate) {
    localConnection.addIceCandidate(event.candidate,
        onAddIceCandidateSuccess, onAddIceCandidateError);
    trace('Remote ICE candidate: \n ' + event.candidate.candidate);
  }
}

function onAddIceCandidateSuccess() {
  trace('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
  trace('Failed to add Ice Candidate: ' + error.toString());
}

function receiveChannelCallback(event) {
  trace('Receive Channel Callback');
  receiveChannel = event.channel;
  receiveChannel.onmessage = onReceiveMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
  receiveChannel.onclose = onReceiveChannelStateChange;
}

function onReceiveMessageCallback(event) {
  trace('Received Message');
  dataChannelReceive.value = event.data;
}

function onSendChannelStateChange() {
  var readyState = sendChannel.readyState;
  trace('Send channel state is: ' + readyState);
  if (readyState === 'open') {
    dataChannelSend.disabled = false;
    dataChannelSend.focus();
    sendButton.disabled = false;
    closeButton.disabled = false;
  } else {
    dataChannelSend.disabled = true;
    sendButton.disabled = true;
    closeButton.disabled = true;
  }
}

function onReceiveChannelStateChange() {
  var readyState = receiveChannel.readyState;
  trace('Receive channel state is: ' + readyState);
}
