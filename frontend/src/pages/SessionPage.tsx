import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import VideoContainer from "../components/VideoContainer.tsx";
import {
  BsMic,
  BsMicMute,
  BsCameraVideo,
  BsCameraVideoOff,
} from "react-icons/bs";
import { FaAngleLeft, FaAngleRight, FaUserGroup } from "react-icons/fa6";
import { FaClipboardList } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useSocket from "../hooks/useSocket.ts";
import SessionSidebar from "../components/session/SessionSidebar.tsx";

interface User {
  id: string;
  nickname: string;
}

interface PeerConnection {
  peerId: string; // 연결된 상대의 ID
  peerNickname: string; // 상대의 닉네임
  stream: MediaStream; // 상대방의 비디오/오디오 스트림
}

const SessionPage = () => {
  const { socket } = useSocket(import.meta.env.VITE_SIGNALING_SERVER_URL);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<PeerConnection[]>([]); // 연결 관리
  const [roomId, setRoomId] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [userVideoDevices, setUserVideoDevices] = useState<MediaDeviceInfo[]>(
    []
  );
  const [userAudioDevices, setUserAudioDevices] = useState<MediaDeviceInfo[]>(
    []
  );
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] =
    useState<string>("");
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] =
    useState<string>("");

  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({});
  const peerVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const navigate = useNavigate();
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
    // 비디오 디바이스 목록 가져오기

    const getUserDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(
          (device) => device.kind === "audioinput"
        );
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );

        setUserAudioDevices(audioDevices);
        setUserVideoDevices(videoDevices);
      } catch (error) {
        console.error("미디어 기기를 찾는데 문제가 발생했습니다.", error);
      }
    };

    getUserDevices();
  }, []);

  useEffect(() => {
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
        socket.off("room_full");
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
        video: selectedVideoDeviceId
          ? { deviceId: selectedVideoDeviceId }
          : true,
        audio: selectedAudioDeviceId
          ? { deviceId: selectedAudioDeviceId }
          : true,
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
    if (!stream) {
      alert(
        "미디어 스트림을 가져오지 못했습니다. 미디어 장치를 확인 후 다시 시도해주세요."
      );
      navigate("/sessions");
      return;
    }

    socket.emit("join_room", { room: roomId, nickname });

    socket.on("room_full", () => {
      console.log("방이 꽉찼심");
      alert(
        "해당 세션은 이미 유저가 가득 찼습니다. 세션 페이지로 이동합니다..."
      );
      navigate("/sessions");
      return;
    });
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
    <section className="w-screen h-screen flex flex-col max-w-7xl">
      <div className="w-screen flex gap-2 mb-4 space-y-2">
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
      </div>
      <div className={"w-screen max-w-7xl flex flex-grow"}>
        <div
          className={
            "camera-area flex flex-col flex-grow justify-between bg-gray-50 border-r"
          }
        >
          <div className={"flex flex-col gap-4 justify-between"}>
            <h1 className={"text-center text-medium-xl font-bold w-full py-4"}>
              프론트엔드 초보자 면접 스터디
            </h1>
            <div className={"speaker w-full px-6"}>
              <VideoContainer
                ref={myVideoRef}
                nickname={nickname}
                isMicOn={isMicOn}
                isVideoOn={isVideoOn}
                isLocal={true}
              />
            </div>
            <div className={"listeners w-full flex gap-2 px-6"}>
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
                    isLocal={false}
                  />
                ))
              }
            </div>
          </div>
          <div
            className={
              "session-footer h-16 inline-flex w-full justify-between items-center border-t px-6"
            }
          >
            <button
              className={"bg-transparent rounded-full border p-3 text-xl"}
            >
              <FaAngleLeft />
            </button>
            <div className={"center-buttons space-x-2"}>
              <button
                onClick={handleVideoToggle}
                className="bg-blue-500 text-white p-3 rounded-full"
                aria-label={isVideoOn ? `비디오 끄기` : "비디오 켜기"}
              >
                {isVideoOn ? <BsCameraVideo /> : <BsCameraVideoOff />}
              </button>
              <button
                onClick={handleMicToggle}
                className="bg-blue-500 text-white p-3 rounded-full"
                aria-label={isMicOn ? `마이크 끄기` : "마이크 켜기"}
              >
                {isMicOn ? <BsMic /> : <BsMicMute />}
              </button>
              <select
                className={"w-32"}
                onChange={(e) => setSelectedVideoDeviceId(e.target.value)}
              >
                {userVideoDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
              <select
                className={"w-32"}
                onChange={(e) => setSelectedAudioDeviceId(e.target.value)}
              >
                {userAudioDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              className={"bg-transparent rounded-full border p-3 text-xl"}
            >
              <FaAngleRight />
            </button>
          </div>
        </div>
        <div className={"flex flex-col justify-between w-[440px] px-6"}>
          <div className={"flex flex-col gap-4"}>
            <div className={"flex flex-col gap-2"}>
              <h2 className={"inline-flex gap-1 items-center text-semibold-s"}>
                <FaClipboardList />
                질문
              </h2>
              <p
                className={
                  "border border-accent-gray p-2 bg-transparent rounded-xl"
                }
              >
                Restful API란 무엇인지 설명해주세요
              </p>
            </div>
            <div className={"flex flex-col gap-2"}>
              <h2 className={"inline-flex gap-1 items-center text-semibold-s"}>
                <FaUserGroup />
                참가자
              </h2>
              <ul>
                <li>참가자 1</li>
                <li>참가자 2</li>
                <li>참가자 3</li>
              </ul>
            </div>
          </div>
          <div className={"h-16 items-center flex w-full"}>
            <button className={"w-full bg-red-500 text-white rounded-md py-2"}>
              종료하기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SessionPage;
