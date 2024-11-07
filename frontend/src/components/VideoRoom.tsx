import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import VideoContainer from "./VideoContainer.tsx";
import {
  BsMic,
  BsMicMute,
  BsCameraVideo,
  BsCameraVideoOff,
} from "react-icons/bs";

interface User {
  id: string;
  nickname: string;
}

interface PeerConnection {
  peerId: string; // 연결된 상대의 ID
  peerNickname: string; // 상대의 닉네임
  stream: MediaStream; // 상대방의 비디오/오디오 스트림
}

const VideoRoom = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<PeerConnection[]>([]); // 연결 관리
  const [roomId, setRoomId] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);

  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({});
  const peerVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // STUN 서버 설정
  const pcConfig = {
    iceServers: [
      {
        urls: import.meta.env.VITE_STUN_SERVER_URL,
        username: import.meta.env.VITE_STUN_USER_NAME,
        credential: import.meta.env.VITE_STUN_CREDENTIAL,
      },
    ],
  };

  useEffect(() => {
    // 소켓 연결
    const newSocket = io(import.meta.env.SIGNALING_SERVER_URL);
    setSocket(newSocket);

    // ref 값을 useEffect 안에서 캡처
    const connections = peerConnections;

    return () => {
      Object.values(connections.current).forEach((pc) => {
        // 모든 이벤트 리스너 제거
        pc.ontrack = null;
        pc.onicecandidate = null;
        pc.oniceconnectionstatechange = null;
        pc.onconnectionstatechange = null;
        // 연결 종료
        pc.close();
      });
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    // 미디어 스트림 정리 로직
    return () => {
      if (myStream) {
        myStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [myStream]);

  useEffect(() => {
    // socket 이벤트 리스너들 정리
    // 메모리 누수, 중복 실행을 방지하기 위해 정리
    return () => {
      if (socket) {
        socket.off("all_users");
        socket.off("getOffer");
        socket.off("getAnswer");
        socket.off("getCandidate");
        socket.off("user_exit");
      }
    };
  }, [socket]);

  // 미디어 스트림 가져오기: 자신의 스트림을 가져옴
  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (myVideoRef.current) {
        myVideoRef.current!.srcObject = stream;
      }
      setMyStream(stream);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  // 미디어 스트림 토글 관련
  const handleVideoToggle = () => {
    try {
      // 비디오 껐다키기
      if (myStream) {
        myStream.getVideoTracks().forEach((videoTrack) => {
          videoTrack.enabled = !videoTrack.enabled;
        });
      }
      setIsVideoOn((prev) => !prev);
    } catch (error) {
      console.error("Error stopping video stream", error);
    }
  };

  const handleMicToggle = () => {
    try {
      if (myStream) {
        myStream.getAudioTracks().forEach((audioTrack) => {
          audioTrack.enabled = !audioTrack.enabled;
        });
      }
      setIsMicOn((prev) => !prev);
    } catch (error) {
      console.error("Error stopping mic stream", error);
    }
  };

  // 방 입장 처리: 사용자가 join room 버튼을 클릭할 때
  const joinRoom = async () => {
    if (!socket || !roomId || !nickname) return;

    const stream = await getMedia();
    if (!stream) return;

    socket.emit("join_room", { room: roomId, nickname });

    // 기존 사용자들의 정보 수신: 방에 있던 사용자들과 createPeerConnection 생성
    socket.on("all_users", (users: User[]) => {
      users.forEach((user) => {
        createPeerConnection(user.id, user.nickname, stream, true);
      });
    });

    // 새로운 Offer 수신: 상대가 통화 요청
    // 발생 시점: 새로운 사용자가 방에 입장했을 때, 기존 사용자가 createOffer를 호출하고 emit했을 때
    socket.on(
      "getOffer",
      async (data: {
        sdp: RTCSessionDescription;
        offerSendID: string;
        offerSendNickname: string;
      }) => {
        // 연결 생성
        const pc = createPeerConnection(
          data.offerSendID,
          data.offerSendNickname,
          stream,
          false
        );
        if (!pc) return;

        try {
          // 상대의 설정 확인하기: 상대의 미디어 형식, 코덱, 해상도 확인
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          // Answer 생성: 수락 응답 만들기 - 내 미디어 설정 정보 생성, 상대 설정과 호환되는 형태로 생성
          const answer = await pc.createAnswer();
          // 로컬 설명 설정: 생성한 Answer 정보를 내 연결에 적용, 실제 통신 준비
          await pc.setLocalDescription(answer);

          // Answer 전송: 생성한 Answer를 상대에게 전송, 실제 연결 수립 시작
          // emit: 서버로 이벤트 전송
          socket.emit("answer", {
            answerReceiveID: data.offerSendID,
            sdp: answer,
            answerSendID: socket.id,
          });
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      }
    );

    // Answer 수신: 상대방이 보낸 응답 수신, 연결 정보 설정, 실제 통신 준비 완료
    socket.on(
      "getAnswer",
      async (data: { sdp: RTCSessionDescription; answerSendID: string }) => {
        // 상대방과의 연결 정보 찾기
        const pc = peerConnections.current[data.answerSendID];
        if (!pc) return;
        try {
          // 상대방의 연결 정보 설정
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        } catch (error) {
          console.error("Error handling answer:", error);
        }
      }
    );

    // ICE candidate 수신: 새로운 연결 경로 정보 수신, 가능한 연결 경로 목록에 추가, 최적의 경로로 자동 전환
    socket.on(
      "getCandidate",
      async (data: { candidate: RTCIceCandidate; candidateSendID: string }) => {
        // 상대방과의 연결 찾기
        const pc = peerConnections.current[data.candidateSendID];
        if (!pc) return;
        try {
          // 새로운 연결 경로 추가
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
          console.error("Error handling ICE candidate:", error);
        }
      }
    );

    // 사용자 퇴장 처리
    socket.on("user_exit", ({ id }: { id: string }) => {
      if (peerConnections.current[id]) {
        // 연결 종료
        peerConnections.current[id].close();
        // 연결 객체 제거
        delete peerConnections.current[id];
        // UI에서 사용자 제거
        setPeers((prev) => prev.filter((peer) => peer.peerId !== id));
      }
    });
  };

  // Peer Connection 생성
  const createPeerConnection = (
    peerSocketId: string,
    peerNickname: string,
    stream: MediaStream,
    isOffer: boolean
  ) => {
    try {
      // 유저 사이의 통신 선로를 생성
      // STUN: 공개 주소를 알려주는 서버
      // ICE: 두 피어 간의 최적의 경로를 찾아줌
      const pc = new RTCPeerConnection(pcConfig);

      // 로컬 스트림 추가: 내 카메라/마이크를 통신 선로(pc)에 연결
      // 상대방에게 나의 비디오/오디오를 전송할 준비
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // ICE candidate 이벤트 처리
      // 가능한 연결 경로를 찾을 때마다 상대에게 알려줌
      pc.onicecandidate = (e) => {
        if (e.candidate && socket) {
          socket.emit("candidate", {
            candidateReceiveID: peerSocketId,
            candidate: e.candidate,
            candidateSendID: socket.id,
          });
        }
      };

      // 연결 상태 모니터링
      // 새로운 연결/연결 시도/연결 완료/연결 끊김/연결 실패/연결 종료
      pc.onconnectionstatechange = () => {
        console.log("연결 상태 변경:", pc.connectionState);
      };
      // ICE 연결 상태 모니터링
      pc.oniceconnectionstatechange = () => {
        console.log("ICE 연결 상태 변경:", pc.iceConnectionState);
      };

      // 원격 스트림 처리(상대가 addTrack을 호출할 때)
      // 상대의 비디오/오디오 신호를 받아 연결하는 과정
      // 상대방 스트림 수신 -> 기존 연결인지 확인 -> 스트림 정보 업데이트/추가
      pc.ontrack = (e) => {
        console.log("Received remote track:", e.streams[0]);
        setPeers((prev) => {
          // 이미 존재하는 피어인지 확인
          const exists = prev.find((p) => p.peerId === peerSocketId);
          if (exists) {
            // 기존 피어의 스트림 업데이트
            return prev.map((p) =>
              p.peerId === peerSocketId ? { ...p, stream: e.streams[0] } : p
            );
          }
          // 새로운 피어 추가
          return [
            ...prev,
            {
              peerId: peerSocketId,
              peerNickname,
              stream: e.streams[0],
            },
          ];
        });
      };

      // Offer를 생성해야 하는 경우에만 Offer 생성
      // Offer: 초대 - Offer 생성 -> 자신의 설정 저장 -> 상대에게 전송
      if (isOffer) {
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            if (socket && pc.localDescription) {
              socket.emit("offer", {
                offerReceiveID: peerSocketId,
                sdp: pc.localDescription,
                offerSendID: socket.id,
                offerSendNickname: nickname,
              });
            }
          })
          .catch((error) => console.error("Error creating offer:", error));
      }

      peerConnections.current[peerSocketId] = pc;
      return pc;
    } catch (error) {
      console.error("Error creating peer connection:", error);
      return null;
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4 space-y-2">
        <input
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={joinRoom}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Join Room
        </button>
        <button
          onClick={handleVideoToggle}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isVideoOn ? <BsCameraVideo /> : <BsCameraVideoOff />}
        </button>
        <button
          onClick={handleMicToggle}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isMicOn ? <BsMic /> : <BsMicMute />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <VideoContainer
          ref={myVideoRef}
          nickname={nickname}
          isMicOn={isMicOn}
          isVideoOn={isVideoOn}
        />

        {
          // 상대방의 비디오 표시
          peers.map((peer) => (
            <VideoContainer
              ref={(el) => {
                // 비디오 엘리먼트가 있고, 스트림이 있을 때
                if (el && peer.stream) {
                  el.srcObject = peer.stream;
                }
                peerVideoRefs.current[peer.peerId] = el;
              }}
              nickname={peer.peerNickname}
              isMicOn={true}
              isVideoOn={true}
            />
          ))
        }
      </div>
    </div>
  );
};

export default VideoRoom;
