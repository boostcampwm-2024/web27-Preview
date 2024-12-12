import { create } from "zustand";

interface SessionFormState {
  category: string;
  sessionName: string;
  questionId: number;
  questionTitle: string;
  participant: 1 | 2 | 3 | 4 | 5;
  access: "PRIVATE" | "PUBLIC";
  tab: "myList" | "savedList";
  selectedOpenId: number;

  setCategory: (category: string) => void;
  setSessionName: (name: string) => void;
  setQuestionId: (id: number) => void;
  setQuestionTitle: (title: string) => void;
  setParticipant: (count: 1 | 2 | 3 | 4 | 5) => void;
  setAccess: (access: "PRIVATE" | "PUBLIC") => void;
  setTab: (tab: "myList" | "savedList") => void;
  setSelectedOpenId: (selectedOpenId: number) => void;

  resetForm: () => void;
  isFormValid: () => boolean;
}

const initialState = {
  category: "",
  sessionName: "",
  questionId: -1,
  questionTitle: "",
  participant: 1 as const,
  access: "PUBLIC" as const,
  tab: "myList" as const,
  selectedOpenId: -1,
};

const useSessionFormStore = create<SessionFormState>((set, get) => ({
  ...initialState,

  setCategory: (category) => set({ category }),
  setSessionName: (name) => set({ sessionName: name }),
  setQuestionId: (id) => set({ questionId: id }),
  setQuestionTitle: (title) => set({ questionTitle: title }),
  setParticipant: (participant) => set({ participant }),
  setAccess: (access) => set({ access }),
  setTab: (tab) => set({ tab }),
  setSelectedOpenId: (id) => set({ selectedOpenId: id }),

  resetForm: () => set(initialState),
  isFormValid: () => {
    const state = get();
    return (
      state.category.trim() !== "" &&
      state.sessionName.trim() !== "" &&
      state.sessionName.trim().length >= 5 &&
      state.questionId > 0 &&
      state.questionTitle.trim() !== ""
    );
  },
}));

export default useSessionFormStore;
