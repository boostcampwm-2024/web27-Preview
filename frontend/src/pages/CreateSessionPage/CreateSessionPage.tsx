import { IoArrowBackSharp } from "react-icons/io5";
import SessionForm from "@/pages/CreateSessionPage/view/SessionForm";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useSessionFormStore from "@/pages/CreateSessionPage/stores/useSessionFormStore";
import SidebarPageLayout from "@components/layout/SidebarPageLayout.tsx";

const CreateSessionPage = () => {
  const navigate = useNavigate();
  const { resetForm } = useSessionFormStore();

  useEffect(() => {
    resetForm();

    return () => {
      resetForm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SidebarPageLayout>
      <div className={"p-20"}>
        <button
          className="flex items-center gap-4 mb-5 text-gray-black text-medium-l"
          onClick={() => navigate("/sessions")}
        >
          <IoArrowBackSharp className="w-5 h-5" />
          <span>스터디 채널로 돌아가기</span>
        </button>
        <h1 className="text-bold-l mb-2">새로운 스터디 세션 만들기</h1>
        <p className="text-medium-l text-gray-400 mb-8">
          면접 스터디를 위한 새로운 세션을 생성합니다.
        </p>
        <SessionForm />
      </div>
    </SidebarPageLayout>
  );
};

export default CreateSessionPage;
