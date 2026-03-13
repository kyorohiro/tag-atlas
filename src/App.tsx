import { useEffect, useState } from "react";
import { useAppActions, useAppState, type AppState } from "./AppStateContext";
import { ReadyPage } from "./ReadyPage";

async function loadSettings(): Promise<Partial<AppState>> {
  // TODO:
  // ここで DB / store / file から読む
  // 今は仮実装
  return {
    selectedFolder: "",
    language: "ja",
  };
}

function MainScreen() {
  const appState = useAppState();

  return (
    <main className="min-h-screen bg-zinc-100 p-8 text-zinc-900">
      <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">tag-atlas</h1>

        <div className="mt-6 rounded-xl border p-4">
          <div>selectedFolder:</div>
          <pre>{appState.selectedFolder || "(empty)"}</pre>
        </div>

        <div className="mt-4 rounded-xl border p-4">
          <div>language:</div>
          <pre>{appState.language}</pre>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  const appActions = useAppActions();
  const appState = useAppState();
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setInitError("");

        const settings = await loadSettings();
        if (!alive) return;

        appActions.initialize(settings);
      } catch (e) {
        if (!alive) return;
        setInitError(String(e));
      } finally {
        if (alive) {
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
  return <MainScreen />;
}