import { openPath, revealItemInDir } from "@tauri-apps/plugin-opener";
import { stat } from "@tauri-apps/plugin-fs";

export async function openInFileManager(path: string) {
  const info = await stat(path);

  if (info.isDirectory) {
    await openPath(path);
    return;
  }

  await revealItemInDir(path);
}

/*
export async function openInFileManager(targetPath: string) {
  const os = await platform();

  let openPath = targetPath;

  // まず targetPath を folder とみなして開いてみる
  // file の場合は親 folder に寄せる
  // 厳密な file/folder 判定は後で追加でもよい

  const parent = await dirname(targetPath);
  if (parent && parent !== targetPath) {
    openPath = parent;
  }

  if (os === "macos") {
    const cmd = Command.create("open-cmd", [openPath]);
    await cmd.execute();
    return;
  }

  if (os === "windows") {
    const cmd = Command.create("explorer-cmd", [openPath]);
    await cmd.execute();
    return;
  }

  const cmd = Command.create("xdg-open-cmd", [openPath]);
  await cmd.execute();
}

    {
      "identifier": "shell:allow-execute",
      "allow": [
        {
          "name": "open-cmd",
          "cmd": "open",
          "args": true,
          "sidecar": false
        },
        {
          "name": "explorer-cmd",
          "cmd": "explorer",
          "args": true,
          "sidecar": false
        },
        {
          "name": "xdg-open-cmd",
          "cmd": "xdg-open",
          "args": true,
          "sidecar": false
        }
      ]
    }
*/