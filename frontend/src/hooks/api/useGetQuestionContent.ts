import getQuestionContent from "@/api/question-list/getQuestionContent";
import { useQuery } from "@tanstack/react-query";

interface QuestionContent {
  id: number;
  content: string;
  index: number;
  questionListId: number;
}

interface ApiResponse {
  id: number;
  title: string;
  contents: QuestionContent[];
  categoryNames: string[];
  usage: number;
  username: string;
}

export const useGetQuestionContent = (questionListId: number) => {
  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["questions", questionListId],
    queryFn: () => getQuestionContent(questionListId),
  });

  return {
    data,
    isLoading,
    error,
  };
};
