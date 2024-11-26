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
  AllUsersResponse,
  ResponseMasterChanged,
  RoomMetadata,
  PeerConnection,
} from "@hooks/type/session";
import {
  SIGNAL_EMIT_EVENT,
  SIGNAL_LISTEN_EVENT,
} from "@/constants/WebSocket/SignalingEvent.ts";
import { SESSION_LISTEN_EVENT } from "@/constants/WebSocket/SessionEvent.ts";

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
  ) => RTCPeerConnection | null;
  closePeerConnection: (socketId: string) => void;
  peerConnections: MutableRefObject<{ [key: string]: RTCPeerConnection }>;
  setPeers: Dispatch<SetStateAction<PeerConnection[]>>;
  setIsHost: Dispatch<SetStateAction<boolean>>;
  setRoomMetadata: Dispatch<SetStateAction<RoomMetadata | null>>;
  handleReaction: (data: { senderId: string; reaction: string }) => void;
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

  const handleRoomFinished = useCallback(() => {
    toast.error("방장이 세션을 종료했습니다.");
    navigate("/sessions");
  }, [toast, navigate]);

  const handleHostChange = useCallback(
    (data: ResponseMasterChanged) => {
      if (socket && data.masterSocketId === socket.id) {
        setIsHost(true);
        toast.success("당신이 호스트가 되었습니다.");
      } else {
        setPeers((prev) =>
          prev.map((peer) =>
            peer.peerId === data.masterSocketId
              ? { ...peer, isHost: true }
              : peer
          )
        );
        toast.success(`${data.masterNickname}님이 호스트가 되었습니다.`);
      }
    },
    [socket, toast, setPeers, setIsHost]
  );

  const setupSocketListeners = useCallback(() => {
    if (!socket || !stream) return;

    const handleAllUsers = ({ roomMetadata, users }: AllUsersResponse) => {
      if (!roomMetadata || !users) {
        console.error("Invalid data received from server:", {
          roomMetadata,
          users,
        });
        return;
      }

      setRoomMetadata(roomMetadata);
      setIsHost(roomMetadata.host === socket.id);
      Object.entries(users).forEach(([socketId, userInfo]) => {
        createPeerConnection(socketId, userInfo.nickname, stream, true, {
          nickname,
          isHost: userInfo.isHost,
        });
      });
    };

    const handleGetOffer = async (data: {
      sdp: RTCSessionDescription;
      offerSendID: string;
      offerSendNickname: string;
    }) => {
      const pc = createPeerConnection(
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

    socket.on(SIGNAL_LISTEN_EVENT.OFFER, handleGetOffer);
    socket.on(SIGNAL_LISTEN_EVENT.ANSWER, handleGetAnswer);
    socket.on(SIGNAL_LISTEN_EVENT.CANDIDATE, handleGetCandidate);
    socket.on(SESSION_LISTEN_EVENT.JOIN, handleAllUsers);
    socket.on(SESSION_LISTEN_EVENT.QUIT, handleUserExit);
    socket.on(SESSION_LISTEN_EVENT.FULL, () => {
      toast.error("해당 세션은 이미 유저가 가득 찼습니다.");
      navigate("/sessions");
    });
    socket.on(SESSION_LISTEN_EVENT.CHANGE_HOST, handleHostChange);
    socket.on(SESSION_LISTEN_EVENT.REACTION, handleReaction);
    socket.on(SESSION_LISTEN_EVENT.FINISH, handleRoomFinished);

    return () => {
      socket.off(SIGNAL_LISTEN_EVENT.OFFER, handleGetOffer);
      socket.off(SIGNAL_LISTEN_EVENT.ANSWER, handleGetAnswer);
      socket.off(SIGNAL_LISTEN_EVENT.CANDIDATE, handleGetCandidate);
      socket.off(SESSION_LISTEN_EVENT.JOIN, handleAllUsers);
      socket.off(SESSION_LISTEN_EVENT.QUIT);
      socket.off(SESSION_LISTEN_EVENT.FULL);
      socket.off(SESSION_LISTEN_EVENT.CHANGE_HOST, handleHostChange);
      socket.off(SESSION_LISTEN_EVENT.REACTION, handleReaction);
      socket.off(SESSION_LISTEN_EVENT.FINISH, handleRoomFinished);

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