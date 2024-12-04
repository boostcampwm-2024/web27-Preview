import { useGetQuestionContent } from "@/hooks/api/useGetQuestionContent";
import { MdEdit } from "react-icons/md";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FaRegBookmark, FaRegUser } from "react-icons/fa";
import ErrorBlock from "@components/common/Error/ErrorBlock.tsx";

const QuestionTitle = ({ questionId }: { questionId: string }) => {
  const {
    data: question,
    isLoading,
    error,
  } = useGetQuestionContent(Number(questionId));

  if (isLoading) return <div></div>;
  if (error)
    return (
      <ErrorBlock
        error={error}
        message={"질문지 제목을 불러오는데 실패했습니다."}
      />
    );
  if (!question) return null;

  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="flex justify-between">
        <h3 className="text-semibold-l">{question.title}</h3>
        <div className="flex gap-3 text-gray-500 dark:text-gray-200">
          <button>
            <MdEdit className="w-6 h-6 hover:text-gray-black dark:hover:text-white" />
          </button>
          <button>
            <RiDeleteBin6Fill className="w-6 h-6 hover:text-gray-black dark:hover:text-white" />
          </button>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="inline-flex items-center gap-1 text-medium-m text-gray-400 dark:text-gray-200">
          <FaRegUser />
          작성자 {question.username} • {question.contents.length}개의 질문
        </div>
        <div className="flex gap-1 items-center">
          <FaRegBookmark />
          <span>{question.usage}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionTitle;
