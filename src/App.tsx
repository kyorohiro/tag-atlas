import { useEffect, useMemo, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useDialog } from "./useDialog";

type UiText = {
  titleJa: string;
  titleEn: string;
  button: string;
  dropHereJa: string;
  dropHereEn: string;
  selectedJa: string;
  selectedEn: string;
  errorJa: string;
  errorEn: string;
};

const text: UiText = {
  titleJa: "このアプリで管理するフォルダーを選択してください。",
  titleEn: "Please select a folder to manage with this app.",
  button: "Folder",
  dropHereJa: "ここにフォルダーをドラッグ＆ドロップ",
  dropHereEn: "Drag and drop a folder here",
  selectedJa: "選択されたフォルダー",
  selectedEn: "Selected folder",
  errorJa: "フォルダーを選択してください。",
  errorEn: "Please select a folder.",
};

function isLikelyFolderPath(path: string): boolean {
  return !!path && !/\.[^/\\]+$/.test(path);
}

export default function App() {
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [error, setError] = useState<string>("");
  const dialog = useDialog();

  const title = useMemo(() => `${text.titleJa}\n${text.titleEn}`, []);

  const chooseFolder = async () => {
    console.log("> chooseFolder");
    try {
      setError("");

      const result = await open({
        directory: true,
        multiple: false,
        title: "Select Folder",
      });
      console.log(result);

      if (!result || Array.isArray(result)) return;

      setSelectedPath(result);
    } catch (e) {
      console.log(e);
      setError(String(e));
    }
  };

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    (async () => {
      unlisten = await getCurrentWindow().onDragDropEvent((event) => {
        if (event.payload.type !== "drop") return;

        const paths = event.payload.paths ?? [];
        if (paths.length === 0) return;

        const firstPath = String(paths[0]);

        if (!isLikelyFolderPath(firstPath)) {
          setError(`${text.errorJa}\n${text.errorEn}`);
          return;
        }

        setError("");
        setSelectedPath(firstPath);
      });
    })();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 text-zinc-900">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            tag-atlas
          </h1>

          <p className="mt-4 whitespace-pre-line text-base leading-7 text-zinc-700">
            {title}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={chooseFolder}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 active:bg-zinc-100"
            >
              {text.button}
            </button>

            <button
              onClick={() => {
                dialog.showConfirmDialog({
                  title: "hello",
                  body: "test",
                });
              }}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 active:bg-zinc-100"
            >
              test dialog
            </button>
          </div>

          <div className="mt-6 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center">
            <div className="text-base font-medium text-zinc-800">
              {text.dropHereJa}
            </div>
            <div className="mt-2 text-sm text-zinc-500">
              {text.dropHereEn}
            </div>
          </div>

          {selectedPath ? (
            <section className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-sm font-semibold text-zinc-800">
                {text.selectedJa}
              </div>
              <div className="mt-1 text-sm text-zinc-500">
                {text.selectedEn}
              </div>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-white p-3 text-sm text-zinc-700">
                {selectedPath}
              </pre>
            </section>
          ) : null}

          {error ? (
            <section className="mt-6 rounded-2xl border border-red-300 bg-red-50 p-4">
              <div className="text-sm font-semibold text-red-700">Error</div>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-white p-3 text-sm text-red-700">
                {error}
              </pre>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}