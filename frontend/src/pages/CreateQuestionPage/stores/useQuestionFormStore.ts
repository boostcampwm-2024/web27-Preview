import { create } from "zustand";

interface Question {
  id: string;
  content: string;
}

interface QuestionState {
  category: string;
  questionTitle: string;
  access: "PRIVATE" | "PUBLIC";
  questionList: Question[];

  setCategory: (category: string) => void;
  setQuestionTitle: (name: string) => void;
  setAccess: (access: "PRIVATE" | "PUBLIC") => void;
  addQuestion: (content: string) => void;
  deleteQuestion: (id: string) => void;
  updateQuestion: (id: string, newContent: string) => void;
  resetForm: () => void;
  isFormValid: () => boolean;
}

const initialState = {
  category: "",
  questionTitle: "",
  access: "PUBLIC" as const,
  questionList: [],
};

const getUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const useQuestionFormStore = create<QuestionState>((set, get) => ({
  ...initialState,

  setCategory: (category) => set({ category }),
  setQuestionTitle: (title) => set({ questionTitle: title }),
  setAccess: (access) => set({ access }),

  addQuestion: (content: string) =>
    set((state) => {
      const currentQuestions = state.questionList;
      if (currentQuestions.length < 20) {
        const newQuestion: Question = {
          id: getUUID(),
          content,
        };
        return { questionList: [...currentQuestions, newQuestion] };
      }
      return state;
    }),

  deleteQuestion: (id: string) =>
    set((state) => ({
      questionList: state.questionList.filter((question) => question.id !== id),
    })),

  updateQuestion: (id: string, newContent: string) =>
    set((state) => ({
      questionList: state.questionList.map((question) =>
        question.id === id ? { ...question, content: newContent } : question
      ),
    })),

  resetForm: () => set(initialState),
  isFormValid: () => {
    const state = get();
    return (
      state.category.trim() !== "" &&
      state.questionTitle.trim() !== "" &&
      state.questionTitle.trim().length >= 5 &&
      state.questionList.length >= 5
    );
  },
}));

export default useQuestionFormStore;
