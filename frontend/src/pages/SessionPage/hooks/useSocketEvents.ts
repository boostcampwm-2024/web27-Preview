import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import useToast from "@hooks/useToast";
import { Socket } from "socket.io-client";
import {
  RoomJoinResponse,
  ResponseMasterChanged,
  RoomMetadata,
  PeerConnection,
  ProgressResponse,
} from "@/pages/SessionPage/types/session";
import {
  SIGNAL_EMIT_EVENT,
  SIGNAL_LISTEN_EVENT,
} from "@/constants/WebSocket/SignalingEvent";
import { SESSION_LISTEN_EVENT } from "@/constants/WebSocket/SessionEvent";
import { STUDY_LISTEN_EVENT } from "@/constants/WebSocket/StudyEvent";

interface UseSocketEventsProps {
  socket: Socket | null;
  stream: MediaStream | null;
  nickname: string;
  sessionId: string;
  createPeerConnection: (
    socketId: string,
    nickname: string,
    stream: MediaStream,
    isOffer: boolean,
    userData: { nickname: string; isHost: boolean }
  ) => Promise<RTCPeerConnection | null>;
  closePeerConnection: (socketId: string) => void;
  peerConnections: MutableRefObject<{ [key: string]: RTCPeerConnection }>;
  setPeers: Dispatch<SetStateAction<PeerConnection[]>>;
  setIsHost: Dispatch<SetStateAction<boolean>>;
  setRoomMetadata: Dispatch<SetStateAction<RoomMetadata | null>>;
  handleReaction: (data: { socketId: string; reactionType: string }) => void;
  setShouldBlock: (shouldBlock: boolean) => void;
}

export const useSocketEvents = ({
  socket,
  stream,
  nickname,
  createPeerConnection,
  closePeerConnection,
  peerConnections,
  setPeers,
  setIsHost,
  setRoomMetadata,
  handleReaction,
  setShouldBlock,
}: UseSocketEventsProps) => {
  const navigate = useNavigate();
  const toast = useToast();
  const reactionTimeouts = useRef<{
    [key: string]: ReturnType<typeof setTimeout>;
  }>({});

  const handleUserExit = useCallback(
    ({ socketId }: { socketId: string }) => {
      toast.error("유저가 나갔습니다.");
      closePeerConnection(socketId);
    },
    [toast, closePeerConnection]
  );

  const handleRoomFinished = () => {
    toast.error("방장이 세션을 종료했습니다.");
    setShouldBlock(false);
    navigate("/sessions");
  };

  const handleHostChange = useCallback(
    (data: ResponseMasterChanged) => {
      if (socket && data.socketId === socket.id) {
        setIsHost(true);
        toast.success("당신이 호스트가 되었습니다.");
      } else {
        setPeers((prev) =>
          prev.map((peer) =>
            peer.peerId === data.socketId ? { ...peer, isHost: true } : peer
          )
        );
        toast.success(`${data.nickname}님이 호스트가 되었습니다.`);
      }
    },
    [socket, toast, setPeers, setIsHost]
  );

  const setupSocketListeners = useCallback(() => {
    if (!socket || !stream) return;

    const handleAllUsers = (data: RoomJoinResponse) => {
      console.log("전체 유저의 정보를 받아옵니다.", data);
      const {
        id,
        category,
        host,
        createdAt,
        inProgress,
        participants,
        maxParticipants,
        status,
        title,
        connectionMap,
        questionListId,
        questionListContents,
        currentIndex,
      } = data;

      const roomMetadata = {
        id,
        title,
        category,
        host,
        status,
        participants,
        maxParticipants,
        createdAt,
        inProgress,
        questionListId,
        questionListContents,
        currentIndex,
      };

      setRoomMetadata(roomMetadata);
      setIsHost(roomMetadata.host.socketId === socket.id);

      Object.entries(connectionMap).forEach(([socketId, userInfo]) => {
        console.log("socketId", socketId, "connection", userInfo);
        createPeerConnection(socketId, userInfo.nickname, stream, true, {
          nickname,
          isHost: roomMetadata.host.socketId === userInfo.socketId,
        });
      });
    };

    const handleGetOffer = async (data: {
      sdp: RTCSessionDescription;
      offerSendID: string;
      offerSendNickname: string;
    }) => {
      const pc = await createPeerConnection(
        data.offerSendID,
        data.offerSendNickname,
        stream,
        false,
        { nickname, isHost: false }
      );
      if (!pc) return;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit(SIGNAL_EMIT_EVENT.ANSWER, {
          answerReceiveID: data.offerSendID,
          sdp: answer,
          answerSendID: socket.id,
        });
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    };

    const handleGetAnswer = async (data: {
      sdp: RTCSessionDescription;
      answerSendID: string;
    }) => {
      const pc = peerConnections.current[data.answerSendID];
      if (!pc) return;

      if (pc.signalingState === "stable") {
        console.warn("Connection already in stable state, ignoring answer");
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    };

    const handleGetCandidate = async (data: {
      candidate: RTCIceCandidate;
      candidateSendID: string;
    }) => {
      const pc = peerConnections.current[data.candidateSendID];
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error("Error handling ICE candidate:", error);
      }
    };

    const handleRoomFull = () => {
      toast.error("해당 세션은 이미 유저가 가득 찼습니다.");
      setShouldBlock(false);
      navigate("/sessions");
    };

    const handleRoomProgress = () => {
      toast.error("해당 세션은 현재 진행 중입니다.");
      setShouldBlock(false);
      navigate("/sessions");
    };

    const handleChangeIndex = (data: { currentIndex: number }) => {
      const { currentIndex } = data;
      if (currentIndex >= 0) {
        setRoomMetadata((prev) => ({ ...prev!, currentIndex }));
      }
    };

    const handleProgress = (data: ProgressResponse) => {
      const { status, inProgress } = data;

      if (status === "success") {
        setRoomMetadata((prev) => ({ ...prev!, inProgress: inProgress }));
        if (inProgress) toast.success("방장이 스터디를 시작했습니다.");
        else toast.error("방장이 스터디를 중지했습니다.");
      } else {
        toast.error("세션 진행을 시작하지 못했습니다.");
      }
    };

    const handleRoomNotFound = async () => {
      toast.error("해당 세션은 존재하지 않습니다.");
      setShouldBlock(false);

      navigate("/sessions");
    };

    socket.on(SIGNAL_LISTEN_EVENT.OFFER, handleGetOffer);
    socket.on(SIGNAL_LISTEN_EVENT.ANSWER, handleGetAnswer);
    socket.on(SIGNAL_LISTEN_EVENT.CANDIDATE, handleGetCandidate);
    socket.on(SESSION_LISTEN_EVENT.JOIN, handleAllUsers);
    socket.on(SESSION_LISTEN_EVENT.QUIT, handleUserExit);
    socket.on(SESSION_LISTEN_EVENT.FULL, handleRoomFull);
    socket.on(SESSION_LISTEN_EVENT.CHANGE_HOST, handleHostChange);
    socket.on(SESSION_LISTEN_EVENT.REACTION, handleReaction);
    socket.on(SESSION_LISTEN_EVENT.FINISH, handleRoomFinished);
    socket.on(SESSION_LISTEN_EVENT.NOT_FOUND, handleRoomNotFound);
    socket.on(STUDY_LISTEN_EVENT.INDEX, handleChangeIndex);
    socket.on(STUDY_LISTEN_EVENT.CURRENT, handleChangeIndex);
    socket.on(STUDY_LISTEN_EVENT.NEXT, handleChangeIndex);
    socket.on(STUDY_LISTEN_EVENT.START, handleProgress);
    socket.on(STUDY_LISTEN_EVENT.STOP, handleProgress);
    socket.on(STUDY_LISTEN_EVENT.PROGRESS, handleRoomProgress);

    return () => {
      socket.off(SIGNAL_LISTEN_EVENT.OFFER, handleGetOffer);
      socket.off(SIGNAL_LISTEN_EVENT.ANSWER, handleGetAnswer);
      socket.off(SIGNAL_LISTEN_EVENT.CANDIDATE, handleGetCandidate);
      socket.off(SESSION_LISTEN_EVENT.JOIN, handleAllUsers);
      socket.off(SESSION_LISTEN_EVENT.QUIT, handleUserExit);
      socket.off(SESSION_LISTEN_EVENT.FULL, handleRoomFull);
      socket.off(SESSION_LISTEN_EVENT.CHANGE_HOST, handleHostChange);
      socket.off(SESSION_LISTEN_EVENT.REACTION, handleReaction);
      socket.off(SESSION_LISTEN_EVENT.FINISH, handleRoomFinished);
      socket.off(SESSION_LISTEN_EVENT.NOT_FOUND, handleRoomNotFound);
      socket.off(STUDY_LISTEN_EVENT.INDEX, handleChangeIndex);
      socket.off(STUDY_LISTEN_EVENT.CURRENT, handleChangeIndex);
      socket.off(STUDY_LISTEN_EVENT.NEXT, handleChangeIndex);
      socket.off(STUDY_LISTEN_EVENT.START, handleProgress);
      socket.off(STUDY_LISTEN_EVENT.STOP, handleProgress);

      if (reactionTimeouts.current) {
        Object.values(reactionTimeouts.current).forEach(clearTimeout);
      }
    };
  }, [
    socket,
    stream,
    nickname,
    createPeerConnection,
    closePeerConnection,
    peerConnections,
    navigate,
    toast,
    handleHostChange,
    handleUserExit,
    handleRoomFinished,
    handleReaction,
  ]);

  useEffect(() => {
    const cleanup = setupSocketListeners();
    return () => cleanup?.();
  }, [setupSocketListeners]);
};
