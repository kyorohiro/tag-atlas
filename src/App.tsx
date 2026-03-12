import { useEffect, useMemo, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./App.css";

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
  // 今は最小版なので雑でOK
  // 後で fs.stat などで厳密に判定
  return !!path && !/\.[^/\\]+$/.test(path);
}

export default function App() {
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [error, setError] = useState<string>("");

  const title = useMemo(
    () => `${text.titleJa}\n${text.titleEn}`,
    []
  );

  /*
  const chooseFolder = async () => {
    console.log('> chooseFolder');
    try {
      setError("");

      const result = await open({
        directory: true,
        multiple: false,
        //title: "Select Folder",
      });
      console.log(result);

      if (!result || Array.isArray(result)) return;

      setSelectedPath(result);
    } catch (e) {
      console.log(e);
      setError(String(e));
    }
  };
  */
  async function chooseFolder() {
    try {
      const result = await open({
        directory: true,
        multiple: false,
        title: "Select Folder",
      });

      console.log("dialog result:", result);
    } catch (e) {
      console.error("dialog open failed:", e);
    }
  }
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
    <main className="container">
      <h1>tag-atlas</h1>

      <p className="lead" style={{ whiteSpace: "pre-line" }}>
        {title}
      </p>

      <button onClick={chooseFolder}>{text.button}</button>

      <div className="dropzone">
        <div>{text.dropHereJa}</div>
        <div>{text.dropHereEn}</div>
      </div>

      {selectedPath ? (
        <section className="panel">
          <div className="label">{text.selectedJa}</div>
          <div className="label">{text.selectedEn}</div>
          <pre>{selectedPath}</pre>
        </section>
      ) : null}

      {error ? (
        <section className="panel error">
          <div className="label">Error</div>
          <pre>{error}</pre>
        </section>
      ) : null}
    </main>
  );
}