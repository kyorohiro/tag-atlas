import { useEffect, useRef, useState } from "react";
import { useAppState } from "./AppStateContext";
import { ensureWorkspaceDb } from "./db";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useDialog } from "./useDialog";

export function MainScreen() {
  const appState = useAppState();
  const [dbPath, setDbPath] = useState("");
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState("");
  const dialog = useDialog();

  //
  const initialized = useRef(false);
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    (async () => {
      if (initialized.current) {
        return;
      } else {
        initialized.current = true;
      }
      unlisten = await getCurrentWindow().onDragDropEvent(async (event) => {
        if (event.payload.type !== "drop") return;

        const paths = event.payload.paths ?? [];
        if (paths.length === 0) return;

        await dialog.showConfirmDialog({
            title: "selected path",
            body: `${event.payload.paths}`,
        });
        const tag = await dialog.showInputDialog({
            title: "TAG を 追加",
        })
        
        /** ここに、path と tag を DB に追加  */
      });
    })();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setDbReady(false);
        setDbError("");

        const result = await ensureWorkspaceDb(appState.selectedFolder);
        if (!alive) return;

        setDbPath(result.dbPath);
        setDbReady(true);
      } catch (e) {
        if (!alive) return;
        setDbError(String(e));
      }
    })();

    return () => {
      alive = false;
    };
  }, [appState.selectedFolder]);

  if (dbError) {
    return (
      <main className="min-h-screen bg-zinc-100 p-8 text-zinc-900">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-300 bg-red-50 p-6 shadow-sm">
          <h1 className="text-2xl font-bold">tag-atlas</h1>
          <p className="mt-4 font-semibold text-red-700">
            DB の初期化に失敗しました
          </p>
          <pre className="mt-4 whitespace-pre-wrap break-all rounded-xl bg-white p-3 text-sm text-red-700">
            {dbError}
          </pre>
        </div>
      </main>
    );
  }

  if (!dbReady) {
    return (
      <main className="min-h-screen bg-zinc-100 p-8 text-zinc-900">
        <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">tag-atlas</h1>
          <p className="mt-4">DB を準備中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-8 text-zinc-900">
      <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">tag-atlas</h1>

        <div className="mt-6 rounded-xl border p-4">
          <div>selectedFolder:</div>
          <pre>{appState.selectedFolder}</pre>
        </div>

        <div className="mt-4 rounded-xl border p-4">
          <div>dbPath:</div>
          <pre>{dbPath}</pre>
        </div>

        <div className="mt-4 rounded-xl border p-4">
          <div>language:</div>
          <pre>{appState.language}</pre>
        </div>
      </div>
    </main>
  );
}
