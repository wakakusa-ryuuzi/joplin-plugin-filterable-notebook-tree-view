import { FolderFilterOptions } from "./filterType";

export function createFolderFilterOptions(): FolderFilterOptions {
  return {
    exactMatch: false,
    regexp: false,
    noChildren: false,
  };
}
