import SidebarPageLayout from "@components/layout/SidebarPageLayout";
import questionList from "/introduce/questionList.png";
import createSession from "/introduce/createSession.png";
import inSession from "/introduce/inSession.png";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { throttle } from "lodash";
import useObserver from "@/pages/IntroPage/hooks/useObserver.ts";
import LeftCard from "./view/leftCard.tsx";
import RightCard from "./view/rightCard.tsx";

const IntroPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const cards = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const { observer } = useObserver();
  const contentRef = useRef<HTMLDivElement>(null);
  const handleScroll = () => {
    if (!contentRef.current) return;
    const scrollTop = (contentRef.current.parentNode as HTMLDivElement)
      .scrollTop;
    if (scrollTop && scrollTop > 10) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };
  const throttledHandleScroll = useCallback(throttle(handleScroll, 16), []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.parentNode?.addEventListener(
        "scroll",
        throttledHandleScroll
      );
    }
  }, []);

  useEffect(() => {
    if (observer.current) {
      cards.forEach((card) => {
        if (card.current) {
          observer.current!.observe(card.current);
        }
      });
    }
  }, []);

  return (
    <SidebarPageLayout>
      <div
        ref={contentRef}
        className="min-h-screen bg-gradient-to-br bg-gray-50 scroll-smooth"
      >
        <div className="relative h-screen">
          <div className=" max-w-6xl mx-auto pt-32 px-8">
            <p className="text-green-100 mb-10 text-semibold-xl text-[2rem] text-center">
              함께하는 면접 스터디
            </p>
            <img className="w-[40rem] mx-auto" src="preview-logo3.png" alt="preview 로고" />
            <div>

            </div>
          </div>
          {!isScrolled && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-16 mt-8 px-6 py-3 text-[1.25rem] text-gray-400">
              스크롤로 자세히 보기
            </div>
          )}
        </div>

        <div className="py-32 px-8 opacity-0" ref={cards[0]}>
          <RightCard
            index={"01"}
            title={
              <>
                면접 연습
                <br />
                질문 리스트 만들기
              </>
            }
            description={
              <>
                원하는 분야에 대한 질문을 내가 원하는대로 만들거나 <br />
                다른 사람이 만든 것도 사용할 수 있어요
              </>
            }
            image={questionList}
            buttonText={"질문 리스트 만들기"}
            onClick={() => navigate("/questions/create")}
          />
        </div>

        <div className="py-32 px-8 bg-gray-900/50 opacity-0" ref={cards[1]}>
          <LeftCard
            index={"02"}
            title={
              <>
                스터디 룸을
                <br />
                내가 원하는 설정으로
              </>
            }
            description={
              <>
                참여 인원부터 원하는 질문지 선택, <br />
                그리고 공개/비공개 설정까지 가능해요
              </>
            }
            image={createSession}
            buttonText={"스터디 룸 만들기"}
            onClick={() => navigate("/sessions/create")}
          />
        </div>

        <div className="pt-32 pb-40 px-8 opacity-0" ref={cards[2]}>
          <RightCard
            index={"03"}
            title={
              <>
                원하는 질문지로 <br />
                사람들과 면접 연습
              </>
            }
            description={
              <>
                1명에서 최대 5명까지 스터디룸에서 <br />
                선택한 질문지로 면접을 연습할 수 있어요
              </>
            }
            image={inSession}
            buttonText={"스터디 채널 보러가기"}
            onClick={() => navigate("/sessions")}
          />
        </div>
      </div>
    </SidebarPageLayout>
  );
};

export default IntroPage;
