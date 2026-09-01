import { create } from "zustand";
import { devtools } from "zustand/middleware";

type HistoryItem = {
  id: string;
  url: string;
};

type EditorState = {
  history: HistoryItem[];
  currentId: string | null;
  addImage: (url: string) => void;
  selectImage: (id: string) => void;
  clearHistory: () => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const useEditorStore = create<EditorState>()(
  devtools((set) => ({
    history: [],
    currentId: null,

    addImage: (url) =>
      set((state) => {
        const item = { id: createId(), url };
        return { history: [...state.history, item], currentId: item.id };
      }),

    selectImage: (id) => set({ currentId: id }),

    clearHistory: () =>
      set((state) => ({
        history: state.history.filter((item) => item.id === state.currentId),
      })),

    prompt: "",
    setPrompt: (prompt) => set({ prompt }),
  })),
);

const useCurrentImageUrl = () =>
  useEditorStore(
    (state) =>
      state.history.find((item) => item.id === state.currentId)?.url ?? null,
  );

export { useEditorStore, useCurrentImageUrl };
export type { HistoryItem };
