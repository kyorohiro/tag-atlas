export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

export function trimTrailingSlash(path: string): string {
  return normalizePath(path).replace(/\/+$/, "");
}

export function isPathInsideRoot(root: string, targetPath: string): boolean {
  const normalizedRoot = trimTrailingSlash(root);
  const normalizedTarget = normalizePath(targetPath);

  return (
    normalizedTarget === normalizedRoot ||
    normalizedTarget.startsWith(`${normalizedRoot}/`)
  );
}

export function toRelativePath(root: string, targetPath: string): string {
  const normalizedRoot = trimTrailingSlash(root);
  const normalizedTarget = normalizePath(targetPath);

  if (normalizedTarget === normalizedRoot) {
    return ".";
  }

  if (!normalizedTarget.startsWith(`${normalizedRoot}/`)) {
    throw new Error("path is outside root");
  }

  return normalizedTarget.slice(normalizedRoot.length + 1);
}

export function toAbsolutePath(root: string, relativePath: string): string {
  const normalizedRoot = trimTrailingSlash(root);
  const normalizedRelative = normalizePath(relativePath).replace(/^\/+/, "");

  if (!normalizedRelative || normalizedRelative === ".") {
    return normalizedRoot;
  }

  return `${normalizedRoot}/${normalizedRelative}`;
}
