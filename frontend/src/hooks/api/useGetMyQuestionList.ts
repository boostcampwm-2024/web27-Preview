import getMyQuestionList from "@/api/question-list/getMyQuestionList";
import { useQuery } from "@tanstack/react-query";

interface UseGetQuestionListProps {
  page?: number;
  limit: number;
}

export const useGetMyQuestionList = ({
  page = 1,
  limit,
}: UseGetQuestionListProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["myQuestions", page, limit],
    queryFn: () => getMyQuestionList({ page, limit }),
  });

  return {
    data,
    isLoading,
    error,
  };
};
