import { api } from "@/api/config/axios.ts";

export const postScrapQuestionList = async (id: string) => {
  const response = await api.post("/api/question-list/scrap", {
    questionListId: id,
  });
  return response.data.success;
};

export const deleteScrapQuestionList = async (id: string) => {
  const response = await api.delete(`/api/question-list/scrap/${id}`);
  return response.data.success;
};
