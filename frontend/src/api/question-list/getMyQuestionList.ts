import axios from "axios";

interface QuestionListProps {
  page: number;
  limit: number;
}

interface Question {
  id: number;
  content: string;
  index: number;
  questionListId: number;
}

interface QuestionList {
  id: number;
  title: string;
  contents: Question[];
  categoryNames: string[];
  isPublic: boolean;
  usage: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    myQuestionLists: QuestionList[];
    meta: {
      itemsPerPage: number;
      totalItems: number;
      currentPage: string;
      totalPages: number;
      sortBy: [string[]];
    };
  };
}

const getMyQuestionList = async ({ page, limit }: QuestionListProps) => {
  const response = await axios.get<ApiResponse>("/api/question-list/my", {
    params: {
      page,
      limit,
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
};

export default getMyQuestionList;
