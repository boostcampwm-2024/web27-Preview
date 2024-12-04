import { useGetMyQuestionList } from "@/hooks/api/useGetMyQuestionList";
import QuestionItem from "@components/mypage/QuestionList/QuestionItem";
import { useGetScrapQuestionList } from "@/hooks/api/useGetScrapQuestionList";

interface ListProps {
  tab: "myList" | "savedList";
  page: number;
}

const QuestionList = ({ tab, page }: ListProps) => {
  const {
    data: myData,
    isLoading: isMyListLoading,
    error: myListError,
  } = useGetMyQuestionList({ page, limit: 8 });
  const {
    data: scrapData,
    isLoading: isScrapListLoading,
    error: scrapListError,
  } = useGetScrapQuestionList({ page, limit: 8 });

  const currentQuestionList =
    tab === "myList" ? myData?.myQuestionLists : scrapData?.questionLists;
  const isLoading = tab === "myList" ? isMyListLoading : isScrapListLoading;
  const error = tab === "myList" ? myListError : scrapListError;

  return (
    <div className="my-4 w-full grid grid-cols-2 gap-3">
      {isLoading ? (
        <div className="col-span-2 flex items-center justify-center min-h-20">
          질문 목록을 불러오는 중입니다
        </div>
      ) : error ? (
        <div className="col-span-2 flex items-center justify-center min-h-20">
          질문 목록을 불러오는데 실패했습니다.
        </div>
      ) : currentQuestionList && currentQuestionList.length > 0 ? (
        currentQuestionList.map((question) => (
          <QuestionItem
            key={question.id}
            questionListId={question.id}
            type={tab === "myList" ? "my" : "saved"}
            page={page}
          />
        ))
      ) : (
        <div className="col-span-2 flex items-center justify-center min-h-20">
          질문 목록이 비어있습니다
        </div>
      )}
    </div>
  );
};

export default QuestionList;
