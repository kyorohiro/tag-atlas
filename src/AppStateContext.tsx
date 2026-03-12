import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "ja" | "en";

type AppState = {
  selectedFolder: string;
  language: Language;
};

type AppActions = {
  setSelectedFolder: (path: string) => void;
  setLanguage: (lang: Language) => void;
};

const AppStateContext = createContext<AppState | null>(null);
const AppActionsContext = createContext<AppActions | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [selectedFolder, setSelectedFolder] = useState("");
  const [language, setLanguage] = useState<Language>("ja");

  const state = useMemo<AppState>(
    () => ({
      selectedFolder,
      language,
    }),
    [selectedFolder, language]
  );

  const actions = useMemo<AppActions>(
    () => ({
      setSelectedFolder,
      setLanguage,
    }),
    []
  );

  return (
    <AppActionsContext.Provider value={actions}>
      <AppStateContext.Provider value={state}>
        {children}
      </AppStateContext.Provider>
    </AppActionsContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

export function useAppActions(): AppActions {
  const ctx = useContext(AppActionsContext);
  if (!ctx) throw new Error("useAppActions must be used within AppStateProvider");
  return ctx;
}
