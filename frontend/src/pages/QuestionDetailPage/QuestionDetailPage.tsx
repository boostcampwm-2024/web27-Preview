import { useNavigate, useParams } from "react-router-dom";
import QuestionTitle from "@components/questions/detail/QuestionTitle.tsx";
import QuestionList from "@components/questions/detail/QuestionList.tsx";
import { useGetQuestionContent } from "@hooks/api/useGetQuestionContent.ts";
import ButtonSection from "@components/questions/detail/ButtonSection.tsx";
import { useEffect, useState } from "react";
import SidebarPageLayout from "@components/layout/SidebarPageLayout.tsx";
import {
  deleteScrapQuestionList,
  postScrapQuestionList,
} from "@/pages/QuestionDetailPage/api/scrapAPI.ts";
import useToast from "@hooks/useToast.ts";
import ErrorBlock from "@components/common/Error/ErrorBlock.tsx";
import LoadingIndicator from "@components/common/LoadingIndicator.tsx";

const QuestionDetailPage = () => {
  const navigate = useNavigate();
  const { questionId } = useParams();
  const [isScrapped, setIsScrapped] = useState(false);
  // TODO: isScrapped 상태를 서버에서 가져오는 로직이 추가되면 해당 로직을 추가
  const toast = useToast();

  const {
    data: question,
    isLoading,
    error,
  } = useGetQuestionContent(Number(questionId!));

  useEffect(() => {
    if (!questionId) {
      navigate("/questions");
    }
  }, [questionId]);

  const shareQuestionList = () => {
    if (question) {
      navigator.clipboard.writeText(window.location.href);
      toast.success(`${question.title} 링크가 복사되었습니다.`);
    }
  };

  return (
    <SidebarPageLayout>
      <div className={"flex h-fit gap-8 max-w-7xl px-12 pt-20"}>
        <div
          className={
            "flex flex-col gap-4 w-47.5 p-8 bg-gray-white rounded-custom-l shadow-16 mb-8"
          }
        >
          <LoadingIndicator loadingState={isLoading} />
          <ErrorBlock
            error={error}
            message={"질문지를 불러오는데 실패했습니다."}
          />
          <QuestionTitle questionId={questionId!} />
          <QuestionList questionId={questionId!} />
          {question && (
            <ButtonSection
              isScrapped={isScrapped}
              scrapQuestionList={async () => {
                if (await postScrapQuestionList(questionId!)) {
                  setIsScrapped(true);
                }
              }}
              unScrapQuestionList={async () => {
                if (await deleteScrapQuestionList(questionId!)) {
                  setIsScrapped(false);
                }
              }}
              shareQuestionList={shareQuestionList}
            />
          )}
        </div>
      </div>
    </SidebarPageLayout>
  );
};

export default QuestionDetailPage;
