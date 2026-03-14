export type Language = "ja" | "en";

export type AppSettings = {
  selectedFolder: string;
  language: Language;
};

const STORAGE_KEY = "tag-atlas:app-settings";

function getDefaultSettings(): AppSettings {
  return {
    selectedFolder: "",
    language: "ja",
  };
}

export async function loadAppSettings(): Promise<AppSettings> {
  console.log("> loadAppSettings");

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultSettings();
    }

    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    console.log(parsed);
    return {
      selectedFolder: parsed.selectedFolder ?? "",
      language: parsed.language ?? "ja",
    };
  } catch (e) {
    console.error("loadAppSettings failed", e);
    return getDefaultSettings();
  }
}

export async function saveAppSettings(
  settings: Partial<AppSettings>,
): Promise<void> {
  console.log("> saveAppSettings", settings);

  try {
    const current = await loadAppSettings();

    const next: AppSettings = {
      ...current,
      ...settings,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.error("saveAppSettings failed", e);
  }
}