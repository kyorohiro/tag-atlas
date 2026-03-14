import { useEffect, useRef, useState } from "react";
import { useAppState } from "./AppStateContext";
import { addTagToPath, ensureWorkspaceDb } from "./db";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useDialog } from "./useDialog";
import Database from "@tauri-apps/plugin-sql";

export function MainScreen() {
  const appState = useAppState();
  const [dbPath, setDbPath] = useState("");
  const [db, setDb] = useState<Database | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState("");
  const dialog = useDialog();

  const dbRef = useRef<Database | null>(null);
  const dialogRef = useRef(dialog);

  useEffect(() => {
    dbRef.current = db;
  }, [db]);

  useEffect(() => {
    dialogRef.current = dialog;
  }, [dialog]);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const unlisten = await getCurrentWindow().onDragDropEvent(async (event) => {
        if (event.payload.type !== "drop") return;

        const currentDb = dbRef.current;
        if (!currentDb) {
          console.log(">> !currentDb");
          return;
        }

        const paths = event.payload.paths ?? [];
        if (paths.length === 0) return;

        const currentDialog = dialogRef.current;

        await currentDialog.showConfirmDialog({
          title: "selected path",
          body: `${paths.join("\n")}`,
        });

        const tag = await currentDialog.showInputDialog({
          title: "TAG を追加",
        });

        if (!tag || !tag.trim()) return;

        try {
          for (const path of paths) {
            await addTagToPath(currentDb, path, tag);
          }

          await currentDialog.showConfirmDialog({
            title: "完了",
            body: `${paths.length} 件の path に tag "${tag}" を追加しました`,
          });
        } catch (e) {
          await currentDialog.showConfirmDialog({
            title: "エラー",
            body: String(e),
          });
        }
      });

      if (disposed) {
        unlisten();
        return;
      }

      cleanup = unlisten;
    })();

    return () => {
      disposed = true;
      if (cleanup) cleanup();
    };
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setDbReady(false);
        setDbError("");
        setDb(null);

        const result = await ensureWorkspaceDb(appState.selectedFolder);
        if (!alive) return;

        setDb(result.db);
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