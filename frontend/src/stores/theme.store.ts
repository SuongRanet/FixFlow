import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  /** The theme actually painted on screen, after resolving "system". */
  resolved: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const prefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const resolveMode = (mode: ThemeMode): "light" | "dark" =>
  mode === "system" ? (prefersDark() ? "dark" : "light") : mode;

/** Toggles the .dark class that index.css keys its dark variant off. */
const applyTheme = (mode: ThemeMode) => {
  const resolved = resolveMode(mode);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  return resolved;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "dark",
      resolved: "dark",
      setMode: (mode) => set({ mode, resolved: applyTheme(mode) }),
      toggle: () => {
        const next = get().resolved === "dark" ? "light" : "dark";
        set({ mode: next, resolved: applyTheme(next) });
      },
    }),
    {
      name: "fixflow-theme",
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        const mode = state?.mode ?? "dark";
        const resolved = applyTheme(mode);
        useThemeStore.setState({ mode, resolved });
      },
    },
  ),
);

/** Called once from main.tsx so the first paint already has the right theme. */
export const initTheme = () => {
  const { mode } = useThemeStore.getState();
  useThemeStore.setState({ resolved: applyTheme(mode) });

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (useThemeStore.getState().mode === "system") {
        useThemeStore.setState({ resolved: applyTheme("system") });
      }
    });
};
