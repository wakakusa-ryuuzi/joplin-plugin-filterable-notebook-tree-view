export const FolderSortOrderField = {
  Title: 'title',
  CreatedTime: 'created_time',
  UpdatedTime: 'updated_time',
} as const;

export type FolderSortOrderField = (typeof FolderSortOrderField)[keyof typeof FolderSortOrderField];

export interface FolderSortOrder {
  field: FolderSortOrderField;
  reverse: boolean;
}

export type FlatFolder = { id: string; title: string; depth: number; icon?: string };
