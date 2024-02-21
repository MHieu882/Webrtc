var socket = io();

var videoChatForm=document.getElementById('video-chat-form');
var videoChatRooms=document.getElementById('video-chat-rooms');
var joinBtn = document.getElementById('join');
var roomName = document.getElementById('roomName');
var localVideo = document.getElementById('local-video');
var PeerVideo = document.getElementById('peer-video');

// btn
var divBtnGroup=document.getElementById('btn-group');
var muteButton=document.getElementById('muteButton');
var leaveButton=document.getElementById('leaveButton');
var hideButton=document.getElementById('hideButton');

var muteFlag= false;
var hideFlag=false;

navigator.getUserMedia=navigator.getUserMedia|| navigator.webkitGetUserMedia||navigator.mozGetUserMedia;     

var creator = false;

var rtcPeerConnection;
var iceServers = {

    iceServers :[
        {
            urls:"stun:stun.services.mozilla.com"
        },
        {
            urls: "stun:stun1.l.google.com:19302"
        },
    ]
};
var userStream;

joinBtn.addEventListener("click",function(){
    if(roomName.value==""){
        alert('please enter a room name');
    }
    else{
        socket.emit('join',roomName.value)//tham gia theo id
    }
});
//mute
muteButton.addEventListener("click",function(){
   muteFlag= !muteFlag;
   if(muteFlag){
        userStream.getTracks()[0].enabled=false;
        muteButton.textContent='Unmute';
   }else{
        userStream.getTracks()[0].enabled=true;
        muteButton.textContent='mute'
   }
});
// hidecam
hideButton.addEventListener("click",function(){
    hideFlag= !hideFlag;
    if(hideFlag){
         userStream.getTracks()[1].enabled=false;
         hideButton.textContent='Show camera';
    }else{
         userStream.getTracks()[1].enabled=true;
         hideButton.textContent='Hide Camera'
    }
 });
 //leave
leaveButton.addEventListener("click",function(){
    socket.emit('leave',roomName);
    videoChatForm.style="display:block";
    divBtnGroup.style="display:none";
    if(userVideo.srcObject){
        userVideo.srcObject.getTracks().forEach(track => track.stop());
        
    }
    if(PeerVideo.srcObject){
        PeerVideo.srcObject.getTracks()[0].stop();
        PeerVideo.srcObject.getTracks()[1].stop();
    }
    if(rtcPeerConnection){
        rtcPeerConnection.ontrack=null;
        rtcPeerConnection.onicecandidate=null;
        rtcPeerConnection.close();
    }
})
socket.on("created",function(){
    creator =true;
    navigator.getUserMedia(
        {
            audio: true ,
            video: true,
        },
        function(stream){
            userStream=stream;
            videoChatForm.style="display:none";
            divBtnGroup.style="display:flex";
            localVideo.srcObject=stream;
            localVideo.onloadeddata=function(e){
                localVideo.play();
            }
        },
        function(error){
            alert("You can't access Media")
        },
    )

});
socket.on("joined",function(){
   //ok roi
    creator=false;
    navigator.getUserMedia(
        {
            audio: true ,
            video: true
        },
        function(stream){
            userStream=stream;
            videoChatForm.style="display:none";
            divBtnGroup.style="display:flex";
            userVideo.srcObject=stream;
            userVideo.onloadeddata=function(e){
                userVideo.play();
            }
            socket.emit("ready",roomName.value);
        },
        function(error){
            alert("You can't access Media")
        },
    )

});
socket.on("full",function(){
    alert("Room is full now")
});

socket.on("ready", function(roomName){
    if(creator){
       //da vo
        rtcPeerConnection= new RTCPeerConnection(iceServers);
        rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
        rtcPeerConnection.ontrack = OnTrackFunction;
        const tracks=userStream.getTracks();
        rtcPeerConnection.addTrack(tracks[0],userStream);//audio
        rtcPeerConnection.addTrack(tracks[1],userStream);
        rtcPeerConnection.createOffer(
            function(offer){
                rtcPeerConnection.setLocalDescription(offer);
                socket.emit("offer", offer, roomName);
            },
            function(error){
                console.log(error);
            }
        );
    }
});

socket.on("candidate",function(candidate){
    var iceCandidate = new RTCIceCandidate(candidate);
    rtcPeerConnection.addIceCandidate(iceCandidate);
});
socket.on("offer",function(offer){
    //chua vo
    if(!creator){
        rtcPeerConnection= new RTCPeerConnection(iceServers);
        rtcPeerConnection.onicecandidate= OnIceCandidateFunction;
        rtcPeerConnection.ontrack= OnTrackFunction;//chay cai nay mmpoi oke
       
        const tracks=userStream.getTracks();
        rtcPeerConnection.addTrack(tracks[0],userStream);//audio
        rtcPeerConnection.addTrack(tracks[1],userStream);
        rtcPeerConnection.setRemoteDescription(offer);
        rtcPeerConnection.createAnswer(
            function(answer){
                rtcPeerConnection.setLocalDescription(answer);
                socket.emit("answer", answer, roomName.value);
            },
            function(error){
                console.log(error);
            }
        );
    }
});
socket.on("answer",function(answer){
    rtcPeerConnection.setRemoteDescription(answer);
});
socket.on("leave",function(){
    creator=true;
    if(PeerVideo.srcObject){
        PeerVideo.srcObject.getTracks()[0].stop();
        PeerVideo.srcObject.getTracks()[1].stop();
    }
    if(rtcPeerConnection){
        rtcPeerConnection.ontrack=null;
        rtcPeerConnection.onicecandidate=null;
        rtcPeerConnection.close();
    }
})
function OnIceCandidateFunction(event){
    if(event){
        socket.emit("candidate", event.candidate, roomName.value)
    }
}
function OnTrackFunction(event){
    PeerVideo.srcObject = event.streams[0];
    PeerVideo.onloadeddata=function(e){
    PeerVideo.play();
    }
}