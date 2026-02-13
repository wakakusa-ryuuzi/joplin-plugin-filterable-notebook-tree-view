export function logDebug(message: string): void {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}][FilterableFolderTreeView] ${message}`);
}
