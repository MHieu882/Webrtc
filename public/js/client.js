var socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// var localStream;
var peerConnection;
socket.emit('Login', userLoggin);;
async function callUser() {
  var Username =document.getElementById('target');
  const targetUsername=Username.value.trim();
  var userConfirmed = confirm("Bạn muốn bắt đầu cuộc gọi video không?");
  if (userConfirmed && targetUsername) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localVideo.srcObject = stream;
      //
      document.getElementById('videoContainer').style.display = 'flex';
      document.getElementById('chat-container').style.display = 'none';
      //
      //
      peerConnection = new RTCPeerConnection();
      peerConnection.ontrack = OnTrackFunction;
      peerConnection.addTrack(stream.getTracks()[0], stream); // audio
      peerConnection.addTrack(stream.getTracks()[1], stream);
      peerConnection.createOffer()
        .then((offer) => {
          peerConnection.setLocalDescription(offer);
          socket.emit('offer', { targetUserId: targetUsername, offer, caller: userLoggin });
        })
    })
    peerConnection.onicecandidate = (event) => handleIceCandidate(event, targetUsername);
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
        document.getElementById('videoContainer').style.display = 'flex';
        document.getElementById('chat-container').style.display = 'none';
        peerConnection = new RTCPeerConnection();
        peerConnection.onicecandidate = (event) => handleIceCandidate(event, data.caller);
        peerConnection.ontrack = OnTrackFunction;
        peerConnection.addTrack(stream.getTracks()[0], stream);
        peerConnection.addTrack(stream.getTracks()[1], stream);
        peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
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
socket.on("candidate", (data) => {
  const IceCandidate=new RTCIceCandidate(data.candidate)
  peerConnection.addIceCandidate(IceCandidate)
    .catch(error => console.error('Error adding ice candidate:', error));
});

// nhận answer
socket.on("answer",(data)=>{
  peerConnection.setRemoteDescription(data.answer);
});

const chatMessages = document.getElementById('card-body msg_card_body');

socket.on('receiveMessage', (data) => {
  const div = document.createElement('div')
  const container = document.createElement('div');;
  let targetUserId =document.getElementById('target');
  let usertarget=targetUserId.value.trim();
  console.log(usertarget);
  if(data.message.sender==usertarget && data.message.receiver==userLoggin){
    div.classList.add('msg_cotainer');
    container.classList.add('d-flex', 'justify-content-start', 'mb-4');
    div.innerHTML = `${data.message.content}`;
    container.appendChild(div);
    chatMessages.appendChild(container)
  }
  
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
    const messageInput = document.getElementById('messageInput');
    let targetUserId =document.getElementById('target');
    let usertarget=targetUserId.value.trim();
    // Lấy giá trị từ textarea
    const message = messageInput.value.trim();
    if (message &&usertarget) {
      const div = document.createElement('div');
      const container=document.createElement('div');

      div.classList.add('msg_cotainer_send');
      container.classList.add('d-flex','justify-content-end', 'mb-4');

      div.innerHTML = `${message}`;
      container.appendChild(div);
      chatMessages.appendChild(container);
      socket.emit('sendMessage',{message,usertarget,userLoggin})
        // Xóa nội dung của textarea sau khi gửi tin nhắn
      messageInput.value = '';
    }
}
function showChatContainer(targetUser) {
  var Username =document.getElementById('target').value.trim();
  if(targetUser=='delete'){
    socket.emit('deleteMessage',{targetUser:Username,userLoggin})
  }else{
  const targetElement = document.getElementById(targetUser);
  document.getElementById('message-container').style.display = 'block';
  
  const currentActiveElement = document.querySelector('.active');
  document.getElementById('target').innerHTML = `${targetUser}`;
  if (currentActiveElement) {
      // Remove 'active' class from the current active element
      currentActiveElement.classList.remove('active');
  }
  // Add 'active' class to the target element
  if (targetElement) {
      targetElement.classList.add('active');
  }
  socket.emit('getMessage', { targetUser });
  }
 
}
socket.on("loadMess", async(data) => {
  const messages=data.messages;
  chatMessages.innerHTML = '';
  document.getElementById('user_info-chat').innerHTML = `<span> ${data.targetUser}  </span>`;
 
//avt
  document.getElementById('avt-chat').src=data.avat;
  //
  messages.forEach((message) => {
    const div = document.createElement('div');
    const container = document.createElement('div');
    if(message.sender==userLoggin && message.receiver==data.targetUser){
      div.classList.add('msg_cotainer_send');
      container.classList.add('d-flex', 'justify-content-end', 'mb-4');
      div.innerHTML = `${message.content}`;
    }else if(message.sender==data.targetUser && message.receiver==userLoggin){
      div.classList.add('msg_cotainer');
      container.classList.add('d-flex', 'justify-content-start', 'mb-4');
      div.innerHTML = `${message.content}`;
    }
    container.appendChild(div);
    chatMessages.appendChild(container)
   
  });
});


//click to show
document.addEventListener('DOMContentLoaded', function() {
  // menu action
  document.getElementById('action_menu_btn').addEventListener('click', function() {
      var actionMenu = document.querySelector('.action_menu');
      if (actionMenu.style.display === 'none' || actionMenu.style.display === '') {
          actionMenu.style.display = 'block';
      } else {
          actionMenu.style.display = 'none';
      }
  });
  // menu user
  document.getElementById('user-menu-btn').addEventListener('click', function() {
    var userMenu = document.querySelector('.user-menu');
    if (userMenu.style.display === 'none' || userMenu.style.display === '') {
        userMenu.style.display = 'block';
    } else {
        userMenu.style.display = 'none';}
  });
});
//create group
function showForm(input) {
  if(input===5){
    document.getElementById('formprofileContainer').style.display = 'block';
  }
  else{
    document.getElementById('formContainer').style.display = 'block';
  }
  document.getElementById('overlay').style.display = 'block';
}

// Function to hide the form overlay
function hideForm() {
 
    document.getElementById('formprofileContainer').style.display ='none';
    document.getElementById('formContainer').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

function endCall() {
  // Your code to end the call
  document.getElementById('chat-container').style.display = 'flex';
  document.getElementById('videoContainer').style.display = 'none';
}
