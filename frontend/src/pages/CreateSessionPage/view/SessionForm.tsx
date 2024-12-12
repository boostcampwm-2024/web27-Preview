import AccessSection from "@components/sessions/create/SessionForm/AccessSection";
import CategorySection from "@components/sessions/create/SessionForm/CategorySection";
import ParticipantSection from "@components/sessions/create/SessionForm/ParticipantSection";
import TitleSection from "@components/sessions/create/SessionForm/TitleSection";
import QuestionListSection from "@components/sessions/create/SessionForm/QuestionListSection";
import ListSelectModal from "@components/sessions/create/SessionForm/ListSelectModal";
import useSessionFormStore from "@/pages/CreateSessionPage/stores/useSessionFormStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useToast from "@hooks/useToast";
import useSocket from "@hooks/useSocket";
import {
  SESSION_EMIT_EVENT,
  SESSION_LISTEN_EVENT,
} from "@/constants/WebSocket/SessionEvent.ts";
import useAuth from "@hooks/useAuth.ts";
import useModal from "@hooks/useModal";

interface RoomCreatedResponse {
  id?: string;
  success?: boolean;
  roomId?: string;
  error?: string;
}

const SessionForm = () => {
  const { socket } = useSocket();
  const { nickname } = useAuth();
  const { category, sessionName, questionId, participant, access } =
    useSessionFormStore();
  const isValid = useSessionFormStore((state) => state.isFormValid());
  const navigate = useNavigate();
  const toast = useToast();
  const modal = useModal();

  const submitHandler = () => {
    if (!isValid || !socket) {
      toast.error("입력값을 확인해주세요.");
      return;
    }

    const roomData = {
      title: sessionName,
      status: access ?? "PUBLIC",
      category,
      questionListId: questionId,
      maxParticipants: participant,
    };

    socket?.emit(SESSION_EMIT_EVENT.CREATE, {
      title: roomData.title,
      category: [roomData.category],
      status: roomData.status,
      nickname: nickname || "방장",
      maxParticipants: roomData.maxParticipants,
      questionListId: roomData.questionListId,
    });
  };

  useEffect(() => {
    if (!socket) return;

    const roomCreatedHandler = (response: RoomCreatedResponse) => {
      if (response.id) {
        navigate(`/session/${response.id}`);
        toast.success(`${sessionName} 세션이 성공적으로 생성되었습니다.`);
      } else {
        toast.error("방 생성에 실패하였습니다.");
        navigate(`/sessions`);
      }
    };
    socket.on(SESSION_LISTEN_EVENT.CREATE, roomCreatedHandler);

    return () => {
      socket.off(SESSION_LISTEN_EVENT.CREATE, roomCreatedHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <div className="flex flex-col gap-7 p-8 bg-gray-white shadow-8 w-47.5 rounded-custom-l">
      <ListSelectModal modal={modal} />
      <CategorySection />
      <TitleSection />
      <QuestionListSection openModal={modal.openModal} />
      <ParticipantSection />
      <AccessSection />
      <button
        className={`w-full h-12 rounded-custom-m text-semibold-r text-gray-white
        ${isValid ? "bg-green-200" : "bg-gray-200"}
          `}
        onClick={submitHandler}
        disabled={!isValid}
      >
        세션 생성하기
      </button>
    </div>
  );
};

export default SessionForm;
