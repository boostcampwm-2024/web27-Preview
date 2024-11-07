import { useRef, useState } from "react";

function App() {
  const [startButtonActive] = useState(true);
  const [status, setStatus] = useState("연결 대기중");

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  // WebRTC 설정

  // 변수 선언

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  // const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  // const [peerConnection, setPeerConnection] =
  //   useState<RTCPeerConnection | null>(null);

  // 미디어 스트림 시작
  async function startCall() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current!.srcObject = stream;
        setLocalStream(stream);
      }

      setStatus("비디오 켜는 중...");
    } catch (e) {
      console.error("미디어 스트림 획득 실패:", e);
      setStatus("카메라/마이크 접근 실패");
    }
  }

  async function stopVideo() {
    try {
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
        setLocalStream(null);
      }
    } catch (e) {
      console.error("비디오 중지 실패:", e);
    }
  }

  return (
    <section className={"flex flex-col gap-3"}>
      <div className="flex gap-3 justify-center">
        <video
          className={"w-80 aspect-video object-cover rounded-md bg-black"}
          ref={localVideoRef}
          id="localVideo"
          autoPlay
          playsInline
          muted
        ></video>
        <video
          className={"w-80 aspect-video rounded-md bg-black"}
          ref={remoteVideoRef}
          id="remoteVideo"
          autoPlay
          playsInline
        ></video>
      </div>
      <div className="flex gap-3 justify-center">
        <video
          className={"w-80 aspect-video object-cover rounded-md bg-black"}
          id="localVideo"
          autoPlay
          playsInline
          muted
        ></video>
        <video
          className={"w-80 aspect-video rounded-md bg-black"}
          id="remoteVideo"
          autoPlay
          playsInline
        ></video>
      </div>
      <div>
        <button
          onClick={!localStream ? startCall : stopVideo}
          disabled={!startButtonActive}
        >
          {!localStream ? "비디오 켜기" : "비디오 끄기"}
        </button>
      </div>
      <div id="connectionStatus">{status}</div>
    </section>
  );
}

export default App;
