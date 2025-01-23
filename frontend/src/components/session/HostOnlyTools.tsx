import { MdArrowForwardIos, MdArrowBackIosNew } from "react-icons/md";
import { useEffect, useState } from "react";
import ToolTip from "../common/ToolTip";

// 툴바에서 호스트만 사용가능 도구들 분리
interface HostOnlyToolsProps {
  isHost: boolean;
  isInProgress: boolean;
  stopStudySession: () => void;
  startStudySession: () => void;
  requestChangeIndex: (type: "next" | "prev") => void;
  currentIndex: number;
  maxQuestionLength: number;
}

const COOLDOWN_TIME_MS = 2000;
const studyButtonClass = "bg-transparent rounded-xl border h-10 px-3 py-2 text-medium-xs";
const directionButtonClass = "relative inline-flex items-center bg-transparent rounded-full border-custom-s h-10 px-3 py-2 disabled:opacity-50 overflow-hidden";
const disabledClass = "origin-left absolute w-full h-full bg-gray-400/50 top-0 left-0 animate-progress";

const HostOnlyTools = ({
  isHost,
  isInProgress,
  stopStudySession,
  startStudySession,
  requestChangeIndex,
  currentIndex,
  maxQuestionLength,
}: HostOnlyToolsProps) => {
  const [changeCooldown, setChangeCooldown] = useState(false);

  useEffect(() => {
    if (!changeCooldown) return;

    const timeout = setTimeout(() => {
      setChangeCooldown(false);
    }, COOLDOWN_TIME_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [changeCooldown]);

  if (!isHost) {
    return null;
  }

  const handleChangeIndex = (type: "next" | "prev") => {
    requestChangeIndex(type);
    setChangeCooldown(true);
  }

  return (
    <>
      <div className={"inline-flex gap-4 items-center mx-8"}>
        {
          isInProgress ?
            <button
              className={studyButtonClass}
              onClick={() => {
                stopStudySession();
              }}
            >
              스터디 종료하기
            </button>
            : <button
              className={studyButtonClass}
              onClick={() => {
                startStudySession();
              }}
            >
              스터디 시작하기
            </button>
        }
      </div>
      {isInProgress && (
        <div className={"study-toolbar"}>
          <ToolTip text="이전 질문">
            <button
              onClick={() => handleChangeIndex("prev")}
              className={directionButtonClass}
              aria-label={"이전 질문 버튼"}
              disabled={changeCooldown || currentIndex === 0}
            >
              <MdArrowBackIosNew />
              {changeCooldown && <div className={disabledClass}></div>}
            </button>
          </ToolTip>
          <ToolTip text="다음 질문">
            <button
              onClick={() => handleChangeIndex("next")}
              className={directionButtonClass}
              aria-label={"다음 질문 버튼"}
              disabled={
                changeCooldown || currentIndex === maxQuestionLength - 1
              }
            >
              <MdArrowForwardIos />
              {changeCooldown && <div className={disabledClass}></div>}
            </button>
          </ToolTip>
        </div>
      )}
    </>
  )
};

export default HostOnlyTools;
