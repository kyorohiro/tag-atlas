import { useEffect, useState } from "react";
import { useAppActions, useAppState, type AppState } from "./AppStateContext";
import { ReadyPage } from "./ReadyPage";
import { MainPage } from "./MainPage";
import { loadAppSettings } from "./appSettingsStore";


export default function App() {
  const appActions = useAppActions();
  const appState = useAppState();
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState("");

  useEffect(() => {
    console.log("> App useEffect")
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setInitError("");

        const settings = await loadAppSettings();
        if (!alive) {
          console.log(">> !alive")
          return;
        }

        appActions.initialize(settings);
      } catch (e) {
        console.log(">> e", e);
        if (!alive) {
          console.log(">> !alive")
          return;
        }
        setInitError(String(e));
      } finally {
        console.log(">> f")
        if (alive) {
          console.log(">> alive")
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [appActions]);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-100 p-8 text-zinc-900">
        <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">tag-atlas</h1>
          <p className="mt-4">読み込み中...</p>
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </main>
    );
  }

  if (initError) {
    return (
      <main className="min-h-screen bg-zinc-100 p-8 text-zinc-900">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-300 bg-red-50 p-6 shadow-sm">
          <h1 className="text-2xl font-bold">tag-atlas</h1>
          <p className="mt-4 font-semibold text-red-700">初期化に失敗しました</p>
          <p className="text-sm text-red-700">Failed to initialize.</p>
          <pre className="mt-4 whitespace-pre-wrap break-all rounded-xl bg-white p-3 text-sm text-red-700">
            {initError}
          </pre>
        </div>
      </main>
    );
  }

  console.log(">>> appState.selectedFolder", appState.selectedFolder);
  if (!appState.selectedFolder) {
     return <ReadyPage />
  }
  return <MainPage />;
}