var socket = io();
const localVideo=document.getElementById('local-video');
const remoteVideo=document.getElementById('remoteVideo');
const videoChatForm=document.getElementById('video-container');
navigator.getUserMedia=navigator.getUserMedia|| navigator.webkitGetUserMedia||navigator.mozGetUserMedia;     
socket.emit('Login',userLoggin);

async function callUser(targetUsername) {
        var userConfirmed = confirm("Bạn muốn bắt đầu cuộc gọi video không?");
        if (userConfirmed && targetUsername) {
          try{
            const localStream  = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
             localVideo.srcObject = localStream ;
            // Tạo peer connection
            peerConnection = new RTCPeerConnection();
            // Thêm track vào peer connection
            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
            // Tạo offer
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit('offer', { targetUserId: targetUsername, offer }); 
        }catch (error) {
            console.error('Error calling user:', error);}
        }else{
         alert('Không tìm thấy User');
    }
}


socket.on('offer', (data) => {
  peerConnection = new RTCPeerConnection();
//loi nay
    // Thêm track vào peer connection
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    // Đặt remote description từ offer
    peerConnection.setRemoteDescription(offer)
        .then(() => peerConnection.createAnswer())
        .then(answer => peerConnection.setLocalDescription(answer))
        .then(() => {
            // Gửi answer đến người gọi
            socket.emit('answer', { targetUserId: 'callerUserId', answer });
        })
        .catch(error => console.error('Error handling offer:', error));
})
socket.on('answer',(data)=>{
   // Đặt remote description từ answer
   peerConnection.setRemoteDescription(answer)
   .catch(error => console.error('Error handling answer:', error));
})