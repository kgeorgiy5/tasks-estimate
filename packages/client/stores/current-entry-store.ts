import { create } from "zustand";
import { getCurrentEntry } from "@/api/tasks";
import { useAuthStore } from "./auth-store";

type TaskEntryDto = {
  _id?: string;
  taskId?: string;
  timeSeconds: number;
  startDateTime: string;
  endDateTime?: string | null;
  userId?: string;
};

type CurrentEntryStore = {
  entry: TaskEntryDto | null;
  isPolling: boolean;
  refresh: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
};

let intervalId: ReturnType<typeof setInterval> | null = null;

export const useCurrentEntryStore = create<CurrentEntryStore>((set, get) => ({
  entry: null,
  isPolling: false,
  refresh: async () => {
    try {
      const data = await getCurrentEntry();
      set({ entry: data ?? null });
      // eslint-disable-next-line no-console
      console.dir(data ?? null);
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error(err);
      set({ entry: null });
    }
  },
  startPolling: () => {
    if (get().isPolling) return;
    get().refresh();
    intervalId = globalThis.setInterval(() => {
      get().refresh();
    }, 60_000);
    set({ isPolling: true });
  },
  stopPolling: () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    set({ isPolling: false });
  },
}));

let _prevAuth = useAuthStore.getState().isAuthenticated;
useAuthStore.subscribe((state) => {
  const isAuthenticated = state.isAuthenticated;
  if (isAuthenticated === _prevAuth) return;
  _prevAuth = isAuthenticated;
  const store = useCurrentEntryStore.getState();
  if (isAuthenticated) {
    store.startPolling();
  } else {
    store.stopPolling();
    store.refresh();
  }
});
