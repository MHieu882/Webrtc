var socket = io();
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-Video');

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// var localStream;
var peerConnection;
socket.emit('Login', userLoggin);;
function callUser() {
  var Username =document.getElementById('target');
  const targetUsername=Username.value.trim()
  var userConfirmed = confirm("Bạn muốn bắt đầu cuộc gọi video không?");
  if (userConfirmed && targetUsername) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localVideo.srcObject = stream;
      peerConnection = new RTCPeerConnection();
      peerConnection.onicecandidate = (event) => handleIceCandidate(event, targetUsername);
      peerConnection.ontrack = OnTrackFunction;
      peerConnection.addTrack(stream.getTracks()[0], stream); // audio
      peerConnection.addTrack(stream.getTracks()[1], stream);
      peerConnection.createOffer()
        .then((offer) => {
          peerConnection.setLocalDescription(offer);
          socket.emit('offer', { targetUserId: targetUsername, offer, caller: userLoggin });
        })
    })
    .catch((error) => {
      console.error("Error accessing media devices:", error);
    });  
}
}

// nhan offer
socket.on('offer', async (data) => {
  const accept = confirm(`Có cuộc gọi từ ${data.caller}. Chấp nhận?`);
  if (accept) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideo.srcObject = stream;
        localVideo.onloadeddata = (e) => {
          localVideo.play();
        };
        peerConnection = new RTCPeerConnection();
        peerConnection.onicecandidate = (event) => handleIceCandidate(event, data.caller);
        peerConnection.ontrack = OnTrackFunction;
        peerConnection.addTrack(stream.getTracks()[0], stream);
        peerConnection.addTrack(stream.getTracks()[1], stream);
        peerConnection.setRemoteDescription(data.offer);
        peerConnection.createAnswer().then((answer) => {
          peerConnection.setLocalDescription(answer);
          socket.emit('answer', { targetUserId: data.caller, answer });
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
  }
});

// nhan candidate
socket.on("candidate",  (data) => {
  const IceCandidate=new RTCIceCandidate(data.candidate)
  peerConnection.addIceCandidate(IceCandidate)
    .catch(error => console.error('Error adding ice candidate:', error));
});

// nhận answer
socket.on("answer",(data)=>{
  peerConnection.setRemoteDescription(data.answer);
});
socket.on('groupCall', (data) => {
  const accept = confirm(`Có cuộc gọi nhóm từ ${data.caller}. Chấp nhận?`);
  if (accept) {
    const participants = data.participants;
    // Thực hiện các bước để tham gia vào cuộc gọi nhóm
    // Gửi thông điệp đồng ý và thực hiện các bước cần thiết
  }
});

socket.on('receiveMessage', (data) => {
  const chatMessages = document.getElementById('chatMessages');
  const li = document.createElement('li');
  li.innerHTML = `<strong>${data.message.sender}:</strong> ${data.message.content}`;
  chatMessages.appendChild(li);
});

function handleIceCandidate(event, targetUserId) {
  if (event.candidate !== null) {
    socket.emit("candidate", { targetUserId, candidate: event.candidate });
  }
}
function OnTrackFunction(event) {
  remoteVideo.srcObject = event.streams[0];
  remoteVideo.onloadeddata = function (e) {
    remoteVideo.play();
  }
}
function sendMessage() {
    var messageInput = document.getElementById('messageInput');
    var targetUserId =document.getElementById('target');
    var usertarget=targetUserId.value.trim();
    // Lấy giá trị từ textarea
    var message = messageInput.value.trim();
    if (message &&usertarget) {
      const chatMessages = document.getElementById('chatMessages');
      const li = document.createElement('li');
      li.innerHTML = `<strong>You:</strong> ${message}`;
      chatMessages.appendChild(li);
      socket.emit('sendMessage',{message,usertarget,userLoggin})
        // Xóa nội dung của textarea sau khi gửi tin nhắn
      messageInput.value = '';
    }
}

function showMainContent(contentId) {
  var contents = document.querySelectorAll('.content-display');
  contents.forEach(function (content) {
      content.style.display = 'none';
  });
  var activeContent = document.getElementById(contentId);
  activeContent.style.display = 'block';
}
function showChatContainer(targetUser) {
  document.getElementById('target').innerHTML = `${targetUser}`;
  socket.emit('getMessage',{targetUser});
}
socket.on("loadMess", async(data) => {
  const messages=data.messages;
  //clear tin cu
  chatMessages.innerHTML = '';
  document.getElementById('chatHeader').innerHTML = `<h2>Chat with ${data.targetUser}</h2>`;
  //set target
  messages.forEach((message) => {
    const li = document.createElement('li');
    if(message.sender==userLoggin && message.receiver==data.targetUser){
      li.innerHTML = `<strong>You:</strong> ${message.content}`;
    }else if(message.sender==data.targetUser && message.receiver==userLoggin){
      li.innerHTML = `<strong>${message.sender}:</strong> ${message.content}`;
    }
    chatMessages.appendChild(li);
  })
  showMainContent('chatContainer');
});