import { GrDown, GrUp } from "react-icons/gr";
import { ImCheckmark } from "react-icons/im";
import useSessionFormStore from "@/pages/CreateSessionPage/stores/useSessionFormStore";
import LoadingIndicator from "@components/common/LoadingIndicator.tsx";
import { FaUsers } from "react-icons/fa6";
import { useGetQuestionContent } from "@hooks/api/useGetQuestionContent.ts";
import ErrorBlock from "@components/common/Error/ErrorBlock.tsx";

interface QuestionList {
  id: number;
  title: string;
  usage: number;
  isStarred?: boolean;
  questionCount?: number;
  categoryNames?: string[];
}

const QuestionItem = ({ item }: { item: QuestionList }) => {
  const {
    questionId,
    selectedOpenId,
    setQuestionId,
    setQuestionTitle,
    setSelectedOpenId,
  } = useSessionFormStore();

  const isSelected = questionId === item.id;
  const isListOpen = selectedOpenId === item.id;
  const {
    data,
    isLoading: questionLoading,
    error,
  } = useGetQuestionContent(item.id);

  const questions = data?.contents || [];

  const checkHandler = (id: number, title: string) => {
    setQuestionId(id);
    setSelectedOpenId(id);
    setQuestionTitle(title);
  };

  const openHandler = (id: number) => {
    if (selectedOpenId === id) {
      setSelectedOpenId(-1);
    } else {
      setSelectedOpenId(id);
    }
  };

  const renderDropdownIcon = () => {
    return isListOpen ? (
      <GrUp className="w-5 h-5 text-gray-600 " />
    ) : (
      <GrDown className="w-5 h-5 text-gray-600" />
    );
  };

  // TODO: 북마크한 질문지 데이터에 카테고리 데이터, 사용 횟수 데이터 백엔드에게 요청

  const selectedStyle = isSelected
    ? "bg-green-200 text-green-50"
    : "bg-gray-300 text-gray-50";

  return (
    <>
      <div className="flex flex-row items-center w-full h-20 border-t-custom-s px-8 py-4">
        <button
          className="mr-6 hover:bg-gray-200 p-1 rounded-md"
          onClick={() => {
            openHandler(item.id);
          }}
        >
          {renderDropdownIcon()}
        </button>
        <div
          className={"flex flex-grow justify-between cursor-pointer"}
          onClick={() => {
            checkHandler(item.id, item.title);
          }}
        >
          <div>
            <div className="flex items-center leading-5 gap-3  mb-1">
              <div
                className={
                  "text-medium-s bg-green-100 bg-opacity-30 rounded-md px-2 text-white"
                }
              >
                {item.categoryNames ? item.categoryNames[0]! : "미분류"}
              </div>
              <span className="inline-flex items-center gap-1 leading-5 text-medium-s text-gray-600">
                <FaUsers /> {item.usage}
              </span>
            </div>
            <p className="text-semibold-r text-gray-black">{item.title}</p>
          </div>
          <button
            className={`flex items-center ml-auto w-10 h-10 rounded-custom-m
            ${selectedStyle}`}
          >
            <ImCheckmark className="m-auto w-5 h-5" />
          </button>
        </div>
      </div>

      {isListOpen && (
        <div className="bg-gray-50 px-20 py-5 transition-all">
          <div className={"h-fit"}>
            <LoadingIndicator loadingState={questionLoading} />
          </div>
          {questions.map((item, index) => {
            return (
              <p key={item.id} className="text-medium-r p-0.5 text-gray-600">
                Q{index + 1}. {item.content}
              </p>
            );
          })}
        </div>
      )}

      <ErrorBlock
        error={error}
        message={"질문 목록을 불러오는데 실패했습니다."}
      />
    </>
  );
};

export default QuestionItem;
