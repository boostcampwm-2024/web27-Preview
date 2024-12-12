import QuestionItem from "./QuestionItem";
import LoadingIndicator from "@components/common/LoadingIndicator.tsx";
import NotFound from "@components/common/Animate/NotFound.tsx";

interface QuestionList {
  id: number;
  title: string;
  contents: Question[];
  categoryNames: string[];
  isPublic: boolean;
  usage: number;
}

interface Question {
  id: number;
  content: string;
  index: number;
  questionListId: number;
}

interface QuestionItemProps {
  questionList: QuestionList[];
  questionLoading: boolean;
}

const QuestionList = ({ questionList, questionLoading }: QuestionItemProps) => {
  return (
    <div className="mb-4 h-80 overflow-y-auto">
      <LoadingIndicator loadingState={questionLoading} />
      {questionList.length > 0 ? (
        questionList.map((item, id) => {
          return (
            <div key={id}>
              <QuestionItem item={item} />
            </div>
          );
        })
      ) : (
        <div className="flex justify-center items-center h-80">
          <NotFound
            className={"flex justify-center h-50"}
            message={"아직 질문지 리스트가 없어요!"}
            redirect={{
              path: "/questions/create",
              buttonText: "질문지 만들러 가기",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionList;
