export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

export function trimTrailingSlash(path: string): string {
  return normalizePath(path).replace(/\/+$/, "");
}

export function isAbsolutePath(path: string): boolean {
  const p = normalizePath(path);

  return (
    p.startsWith("/") ||               // macOS / Linux
    /^[A-Za-z]:\//.test(p) ||         // Windows drive letter
    p.startsWith("//")                // UNC
  );
}

export function isPathInsideRoot(root: string, targetPath: string): boolean {
  const normalizedRoot = trimTrailingSlash(root);
  const normalizedTarget = normalizePath(targetPath);

  return (
    normalizedTarget === normalizedRoot ||
    normalizedTarget.startsWith(`${normalizedRoot}/`)
  );
}

export function toStoredPath(root: string, targetPath: string): string {
  const normalizedRoot = trimTrailingSlash(root);
  const normalizedTarget = normalizePath(targetPath);

  if (
    normalizedTarget === normalizedRoot ||
    normalizedTarget.startsWith(`${normalizedRoot}/`)
  ) {
    if (normalizedTarget === normalizedRoot) {
      return ".";
    }
    return normalizedTarget.slice(normalizedRoot.length + 1);
  }

  return normalizedTarget;
}

export function toAbsolutePath(root: string, storedPath: string): string {
  const normalizedRoot = trimTrailingSlash(root);
  const normalizedStored = normalizePath(storedPath);

  if (isAbsolutePath(normalizedStored)) {
    return normalizedStored;
  }

  if (normalizedStored === "." || normalizedStored === "") {
    return normalizedRoot;
  }

  return `${normalizedRoot}/${normalizedStored.replace(/^\/+/, "")}`;
}