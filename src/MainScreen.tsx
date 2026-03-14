import { useEffect, useRef, useState } from "react";
import { useAppActions, useAppState } from "./AppStateContext";
import { addTagToPath, ensureWorkspaceDb, searchPathsByTag } from "./db";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useDialog } from "./useDialog";
import Database from "@tauri-apps/plugin-sql";
import { openInFileManager } from "./openPath";

export function MainScreen() {
    const appState = useAppState();
    const appActions = useAppActions();
    const [dbPath, setDbPath] = useState("");
    const [db, setDb] = useState<Database | null>(null);
    const [dbReady, setDbReady] = useState(false);
    const [dbError, setDbError] = useState("");
    const [searchText, setSearchText] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [searchResults, setSearchResults] = useState<
        { path: string; tag: string; created_at: string }[]
    >([]);

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
            const unlisten = await getCurrentWindow().onDragDropEvent(
                async (event) => {
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

                        if (searchText.trim()) {
                            const rows = await searchPathsByTag(currentDb, searchText);
                            setSearchResults(rows);
                        }
                    } catch (e) {
                        await currentDialog.showConfirmDialog({
                            title: "エラー",
                            body: String(e),
                        });
                    }
                },
            );

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
    }, [searchText]);

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

    useEffect(() => {
        let alive = true;

        (async () => {
            if (!db || !searchText.trim()) {
                setSearchResults([]);
                setSearchError("");
                setSearching(false);
                return;
            }

            try {
                setSearching(true);
                setSearchError("");

                const rows = await searchPathsByTag(db, searchText);

                if (!alive) return;
                setSearchResults(rows);
            } catch (e) {
                if (!alive) return;
                setSearchError(String(e));
                setSearchResults([]);
            } finally {
                if (!alive) return;
                setSearching(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [db, searchText]);

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
                <div className="flex items-center justify-between gap-4">
                    <button
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-100"
                        onClick={() => {
                            appActions.setSelectedFolder("");
                        }}
                    >
                        ← Back to Select Folder ({appState.selectedFolder})
                    </button>

                    <h1 className="text-2xl font-bold">tag-atlas</h1>
                </div>

                <div className="mt-4 rounded-xl border p-4">
                    <div className="mb-2 font-semibold">TAG Search</div>

                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="tag を入力..."
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-500"
                    />

                    {searching && (
                        <div className="mt-3 text-sm text-zinc-500">検索中...</div>
                    )}

                    {searchError && (
                        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                            {searchError}
                        </div>
                    )}

                    {!searching && !searchError && searchText.trim() && (
                        <div className="mt-3 text-sm text-zinc-500">
                            {searchResults.length} 件
                        </div>
                    )}

                    <div className="mt-4 space-y-3">
                        {searchResults.map((item, index) => (
                            <div
                                key={`${item.path}:${item.tag}:${index}`}
                                className="rounded-xl border border-zinc-200 bg-zinc-50 p-3"
                            >
                                <div className="text-sm font-medium text-zinc-900">
                                    {item.tag}
                                </div>
                                <pre className="mt-2 whitespace-pre-wrap break-all text-sm text-zinc-700">
                                    {item.path}
                                </pre>
                                <div className="mt-2 text-xs text-zinc-500">
                                    added: {item.created_at}
                                </div>
                                <button
                                    className="rounded-lg border px-3 py-1 text-sm hover:bg-zinc-100"
                                    onClick={async () => {
                                        try {
                                            await openInFileManager(item.path);
                                        } catch (e) {
                                            console.log(e);
                                            await dialog.showConfirmDialog({
                                                title: "エラー",
                                                body: String(e),
                                            });
                                        }
                                    }}
                                >
                                    Open
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}