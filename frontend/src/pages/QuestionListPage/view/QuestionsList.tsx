import QuestionsPreviewCard from "@components/questions/QuestionsPreviewCard.tsx";
import type { QuestionList } from "@/pages/QuestionListPage/types/QuestionList.ts";

interface QuestionListProps {
  questionList: QuestionList[];
  tab: "ALL" | "SCRAP";
}

const QuestionsList = ({
  questionList,
  tab,
}: QuestionListProps) => {
  if (questionList.length === 0) {
    return <div className="text-center mt-12 text-medium-l text-gray-500">스크랩한 질문지가 없습니다.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {questionList.map((list) => (
        <QuestionsPreviewCard
          key={list.id}
          id={list.id}
          questionCount={list.questionCount ?? 0}
          category={list.categoryNames ? list.categoryNames[0] : "미분류"}
          title={list.title}
          isStarred={tab === "SCRAP" ? true : list.isStarred}
          usage={list.usage}
        />
      ))}
    </div>
  );
};

export default QuestionsList;
