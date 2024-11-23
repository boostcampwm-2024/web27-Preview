import { useMutation } from "@tanstack/react-query";
import { createQuestionList } from "@/api/questions/create";
import useToast from "@/hooks/useToast";
import { useNavigate } from "react-router-dom";

export const useCreateQuestion = () => {
  const toast = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createQuestionList,
    onSuccess: (response) => {
      const questionListId = response.data.createdQuestionList.id;
      toast.success("질문지 생성에 성공했습니다.");
      navigate(`questions/${questionListId}`);
    },
    onError: () => {
      toast.error("질문지 생성에 실패했습니다.");
    },
  });
};