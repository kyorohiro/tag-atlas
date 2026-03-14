import { useEffect, useMemo, useState } from "react";
import type Database from "@tauri-apps/plugin-sql";
import { getTagsByPath, replaceTagsByPath } from "./db";

type Props = {
  db: Database;
  path: string;
  onClose: () => void;
  onSaved?: () => void;
};

export function TagEditDialog({ db, path, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [inputTag, setInputTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const rows = await getTagsByPath(db, path);
        if (!alive) return;

        setTags(rows.map((v) => v.tag));
      } catch (e) {
        if (!alive) return;
        setError(String(e));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [db, path]);

  const normalizedTags = useMemo(() => {
    return [...new Set(tags.map((v) => v.trim()).filter(Boolean))];
  }, [tags]);

  const addTag = () => {
    const tag = inputTag.trim();
    if (!tag) return;
    if (normalizedTags.includes(tag)) {
      setInputTag("");
      return;
    }
    setTags((prev) => [...prev, tag]);
    setInputTag("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((v) => v !== tag));
  };

  const save = async () => {
    try {
      setSaving(true);
      setError("");

      await replaceTagsByPath(db, path, normalizedTags);

      onSaved?.();
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Tag編集</h2>
            <pre className="mt-2 whitespace-pre-wrap break-all text-sm text-zinc-600">
              {path}
            </pre>
          </div>

          <button
            className="rounded-lg border px-3 py-1 text-sm"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-zinc-500">読み込み中...</div>
        ) : (
          <>
            <div className="mt-6">
              <div className="mb-2 font-semibold">現在のTAG</div>

              {normalizedTags.length === 0 ? (
                <div className="text-sm text-zinc-500">tag はまだありません</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {normalizedTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-2 rounded-full border bg-zinc-50 px-3 py-1"
                    >
                      <span className="text-sm">{tag}</span>
                      <button
                        className="text-sm text-red-600"
                        onClick={() => removeTag(tag)}
                        disabled={saving}
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <div className="mb-2 font-semibold">TAG追加</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputTag}
                  onChange={(e) => setInputTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="tag を入力"
                  className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
                  disabled={saving}
                />
                <button
                  className="rounded-lg border px-4 py-2"
                  onClick={addTag}
                  disabled={saving}
                >
                  追加
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-end gap-2">
              <button
                className="rounded-lg border px-4 py-2"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="rounded-lg border bg-zinc-900 px-4 py-2 text-white"
                onClick={save}
                disabled={saving}
              >
                {saving ? "保存中..." : "OK"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
