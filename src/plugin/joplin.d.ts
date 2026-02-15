/**
 * Joplin API paginated response type
 * Based on: https://joplinapp.org/help/api/references/rest_api/#pagination
 */
export interface PaginatedResponse<T> {
  /** The array of items requested */
  items: T[];

  /** If true, there are more items after this page. If false, you have reached the end of the data set. */
  has_more: boolean;
}


/**
 * Joplin Folder (Notebook) type definition
 * Based on: https://joplinapp.org/help/api/references/rest_api/#folders
 * Note: In Joplin, "Folder" is the internal name for what users see as "Notebook"
 */
export interface Folder {
  /** Folder ID */
  id: string;

  /** The folder title */
  title: string;

  /** When the folder was created (Unix timestamp in milliseconds) */
  created_time: number;

  /** When the folder was last updated (Unix timestamp in milliseconds) */
  updated_time: number;

  /** When the folder was created. It may differ from created_time as it can be manually set by the user. */
  user_created_time: number;

  /** When the folder was last updated. It may differ from updated_time as it can be manually set by the user. */
  user_updated_time: number;

  /** Encryption cipher text */
  encryption_cipher_text?: string;

  /** Encryption applied (0 or 1) */
  encryption_applied: number;

  /** Parent folder ID (for nested notebooks) */
  parent_id?: string;

  /** Is shared (0 or 1) */
  is_shared: number;

  /** The ID of the Joplin Server/Cloud share containing the folder. Empty if not shared. */
  share_id?: string;

  /** Master key ID */
  master_key_id?: string;

  /** Folder icon */
  icon?: string;

  /** User data */
  user_data?: string;

  /** Deleted time (Unix timestamp in milliseconds) */
  deleted_time?: number;

  /** Child folders (when fetched as tree structure) */
  children?: Folder[];
}


export interface FolderIcon {
  emoji? : string;
  name?: string;
  type?: number;
}
