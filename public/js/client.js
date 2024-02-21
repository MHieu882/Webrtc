var socket = io();
const localVideo=document.getElementById('local-video');
const remoteVideo=document.getElementById('peer-video');
const videoChatForm=document.getElementById('video-chat-form');
const divBtnGroup= document.getElementById('btn-group');
var muteButton=document.getElementById('muteButton');
var leaveButton=document.getElementById('leaveButton');
var hideButton=document.getElementById('hideButton');
let peerConnection;
navigator.getUserMedia=navigator.getUserMedia|| navigator.webkitGetUserMedia||navigator.mozGetUserMedia;
socket.emit('Login',userLoggin);
socket.on('offer',(data)=>{
    //da goi dc
    const {offer}=data;
    handleOffer(offer);
    // console.log('xin chao tu server');
})
socket.on('answer',(data)=>{
    const {answer}=data;
    handleAnswer(answer);
})
socket.on('icecandidate',(data)=>{
    const {candidate}=data;
    handleIceCandidate(candidate);
})
// Người gọi tạo offe
async function callUser(calleeUserId){
    try{
        const localStream  = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        localVideo.srcObject = localStream ;
        // Tạo peer connection
        peerConnection = new RTCPeerConnection();
        // Thêm track vào peer connection
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
        // Tạo offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer)
        // Gửi offer đến người được gọi
        socket.emit('offer', { targetUserId: calleeUserId, offer });
    }catch (error) {
        console.error('Error calling user:', error);
}
}function handleOffer(offer) {
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
}

// Xử lý answer từ người được gọi
function handleAnswer(answer) {
    // Đặt remote description từ answer
    peerConnection.setRemoteDescription(answer)
        .catch(error => console.error('Error handling answer:', error));
}

// Xử lý ice candidate từ cả hai đối tác
function handleIceCandidate(candidate) {
    // Thêm ice candidate vào peer connection
    peerConnection.addIceCandidate(candidate)
        .catch(error => console.error('Error handling ice candidate:', error));
}
