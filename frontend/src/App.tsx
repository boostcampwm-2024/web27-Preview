import { useEffect, useRef, useState } from 'react';
import './App.css'
import { io, Socket } from 'socket.io-client';

interface IWebRTCUser {
  id: string;
  email: string;
  stream: MediaStream;
}

interface Props {
  email: string;
  stream: MediaStream;
  muted?: boolean;
}

function App() {
  const [users, setUsers] = useState<Array<IWebRTCUser>>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const pcDictRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});

  const pcConfig = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302"
      }
    ]
  };

  useEffect(() => {
    let localStream: MediaStream;
    const newSocket = io("http://localhost:3000");
    const newPC = new RTCPeerConnection(pcConfig);

    const createPeerConnection = (
      socketID: string,
      email: string,
      newSocket: Socket,
      localStream: MediaStream
    ): RTCPeerConnection => {
      let pc = new RTCPeerConnection(pcConfig);

      pcDictRef.current[socketID] = pc;

      pc.onicecandidate = e => {
        if (e.candidate) {
          console.log("onicecandidate");
          newSocket.emit("candidate", {
            candidate: e.candidate,
            candidateSendID: newSocket.id,
            candidateReceiveID: socketID
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log("ICE Connection State:", pc.iceConnectionState);
      };

      pc.ontrack = (e: RTCTrackEvent) => {
        console.log("ontrack event triggered for:", email);
        console.log("Received streams:", e.streams);

        const videoTracks = e.streams[0].getVideoTracks();
        console.log("Received video tracks:", videoTracks);

        if (e.streams && e.streams[0]) {
          setUsers(oldUsers => {
            const existingUserIndex = oldUsers.findIndex(user => user.id === socketID);
            if (existingUserIndex !== -1) {
              if (oldUsers[existingUserIndex].stream !== e.streams[0]) {
                const updatedUsers = [...oldUsers];
                updatedUsers[existingUserIndex].stream = e.streams[0];
                return updatedUsers;
              }
              return oldUsers;
            }
            return [...oldUsers, {
              id: socketID,
              email: email,
              stream: e.streams[0]
            }];
          });
        }
      };

      if (localStream) {
        console.log("Adding local stream tracks:", localStream.getTracks());
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      } else {
        console.log("Warning: No local stream available when creating peer connection");
      }

      return pc;
    };

    newSocket.on("all_users", (allUsers: Array<{ id: string; email: string }>) => {
      console.log("Received all_users event:", allUsers);
      let len = allUsers.length;

      for (let i = 0; i < len; i++) {
        const pc = createPeerConnection(
          allUsers[i].id,
          allUsers[i].email,
          newSocket,
          localStream
        );

        setTimeout(() => {
          pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          })
            .then(sdp => {
              console.log("Created offer:", sdp);
              pc.setLocalDescription(new RTCSessionDescription(sdp));
              newSocket.emit("offer", {
                sdp: sdp,
                offerSendEmail: "example@naver.com",
                offerReceiveID: allUsers[i].id
              });
            })
            .catch(error => {
              console.error("Error creating offer:", error);
            });
        }, 100);
      }
    });

    const initializeMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: 240,
            height: 240
          }
        });

        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        localStream = stream;

        const randomEmail = `user${Math.floor(Math.random() * 1000)}@example.com`;
        console.log("Joining room with email:", randomEmail);

        newSocket.emit("join_room", {
          room: "example",
          email: randomEmail,
        });
      } catch (error) {
        console.error(`getUserMedia error: ${error}`);
      }
    };

    initializeMediaStream();

    newSocket.on("getOffer", (data: {
      sdp: RTCSessionDescription;
      offerSendID: string;
      offerSendEmail: string;
    }) => {
      console.log("Received offer from:", data.offerSendEmail);
      const pc = createPeerConnection(
        data.offerSendID,
        data.offerSendEmail,
        newSocket,
        localStream
      );

      pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        .then(() => {
          console.log("Set remote description success");
          return pc.createAnswer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: true,
          });
        })
        .then(sdp => {
          console.log("Created answer:", sdp);
          return pc.setLocalDescription(new RTCSessionDescription(sdp));
        })
        .then(() => {
          newSocket.emit("answer", {
            sdp: pc.localDescription,
            answerSendID: newSocket.id,
            answerReceiveID: data.offerSendID,
          });
        })
        .catch(error => {
          console.error("Error in offer handling:", error);
        });
    });

    return () => {
      Object.values(pcDictRef.current).forEach(pc => pc.close());
      pcDictRef.current = {};
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      newSocket.disconnect();
      newPC.close();
    };
  }, []);

  return (
    <div>
      <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: "black",
        }}
        muted
        ref={localVideoRef}
        autoPlay
        playsInline
      ></video>
      {users.map((user, index) => (
        <Video key={user.id} email={user.email} stream={user.stream} />
      ))}
    </div>
  );
}

const Video = ({ email, stream, muted }: Props) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [isMuted] = useState<boolean>(muted || false);

  useEffect(() => {
    console.log("Setting up video for:", email, "Stream:", stream);
    if (ref.current && stream) {
      ref.current.srcObject = stream;
      console.log("Stream tracks:", stream.getTracks());
    }
  }, [stream, email]);

  return (
    <div>
      <video
        ref={ref}
        muted={isMuted}
        autoPlay
        playsInline
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: "black",
        }}
      />
      <p>{email}</p>
    </div>
  );
};

export default App;