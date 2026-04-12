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

let intervalId: number | null = null;

export const useCurrentEntryStore = create<CurrentEntryStore>((set, get) => ({
  entry: null,
  isPolling: false,
  refresh: async () => {
    try {
      const data = await getCurrentEntry();
        set({ entry: data ?? null });
        // Log the fetched entry for debugging
        // NOTE: intentional runtime debug output
        // eslint-disable-next-line no-console
        console.dir(data ?? null);
    } catch (err: unknown) {
      // log and reset entry on error
      // NOTE: swallow errors to keep polling running
      // eslint-disable-next-line no-console
      console.error(err);
      set({ entry: null });
    }
  },
  startPolling: () => {
    if (get().isPolling) return;
    // fetch immediately
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

// Auto start/stop polling based on auth state
useAuthStore.subscribe(
  (s) => s.isAuthenticated,
  (isAuthenticated) => {
    const store = useCurrentEntryStore.getState();
    if (isAuthenticated) {
      store.startPolling();
    } else {
      store.stopPolling();
      store.refresh();
    }
  },
);
