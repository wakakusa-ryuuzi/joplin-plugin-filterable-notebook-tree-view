/**
 * Joplin Resource (attachment) type definition
 * Based on: https://joplinapp.org/help/api/references/rest_api/#resources
 */
export interface Resource {
  /** Resource ID */
  id: string;

  /** The resource title */
  title: string;

  /** MIME type */
  mime: string;

  /** Filename */
  filename: string;

  /** When the resource was created (Unix timestamp in milliseconds) */
  created_time: number;

  /** When the resource was last updated (Unix timestamp in milliseconds) */
  updated_time: number;

  /** When the resource was created. It may differ from created_time as it can be manually set by the user. */
  user_created_time: number;

  /** When the resource was last updated. It may differ from updated_time as it can be manually set by the user. */
  user_updated_time: number;

  /** File extension */
  file_extension: string;

  /** Encryption cipher text */
  encryption_cipher_text?: string;

  /** Encryption applied (0 or 1) */
  encryption_applied: number;

  /** Encryption blob encrypted (0 or 1) */
  encryption_blob_encrypted: number;

  /** File size in bytes */
  size: number;

  /** Is shared (0 or 1) */
  is_shared: number;

  /** The ID of the Joplin Server/Cloud share containing the resource. Empty if not shared. */
  share_id?: string;

  /** Master key ID */
  master_key_id?: string;

  /** User data */
  user_data?: string;

  /** Blob updated time (Unix timestamp in milliseconds) */
  blob_updated_time?: number;

  /** OCR text */
  ocr_text?: string;

  /** OCR details */
  ocr_details?: string;

  /** OCR status */
  ocr_status?: number;

  /** OCR error */
  ocr_error?: string;

  /** OCR driver ID */
  ocr_driver_id?: number;
}
