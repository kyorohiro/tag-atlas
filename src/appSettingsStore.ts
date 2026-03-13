import { Store } from "@tauri-apps/plugin-store";

export type Language = "ja" | "en";

export type AppSettings = {
  selectedFolder: string;
  language: Language;
};

const STORE_FILE = "app-settings.json";

let storePromise: Promise<Store> | null = null;

async function getStore(): Promise<Store> {
  if (!storePromise) {
    storePromise = Store.load(STORE_FILE);
  }
  return storePromise;
}

export async function loadAppSettings(): Promise<Partial<AppSettings>> {
  const store = await getStore();

  const selectedFolder = await store.get<string>("selectedFolder");
  const language = await store.get<Language>("language");

  return {
    selectedFolder: selectedFolder ?? "",
    language: language ?? "ja",
  };
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  const store = await getStore();

  await store.set("selectedFolder", settings.selectedFolder);
  await store.set("language", settings.language);
  await store.save();
}