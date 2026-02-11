/**
 * Joplin Tag type definition
 * Based on: https://joplinapp.org/help/api/references/rest_api/#tags
 */
export interface Tag {
  /** Tag ID */
  id: string;

  /** The tag title */
  title: string;

  /** When the tag was created (Unix timestamp in milliseconds) */
  created_time: number;

  /** When the tag was last updated (Unix timestamp in milliseconds) */
  updated_time: number;

  /** When the tag was created. It may differ from created_time as it can be manually set by the user. */
  user_created_time: number;

  /** When the tag was last updated. It may differ from updated_time as it can be manually set by the user. */
  user_updated_time: number;

  /** Encryption cipher text */
  encryption_cipher_text?: string;

  /** Encryption applied (0 or 1) */
  encryption_applied: number;

  /** Is shared (0 or 1) */
  is_shared: number;

  /** Parent tag ID */
  parent_id?: string;

  /** User data */
  user_data?: string;
}
