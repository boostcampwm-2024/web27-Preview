import { api } from "@/api/config/axios.ts";

const getQuestionContent = async (questionListId: number) => {
  const response = await api.post("/api/question-list/contents", {
    questionListId,
  });

  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data.questionListContents;
};

export default getQuestionContent;
