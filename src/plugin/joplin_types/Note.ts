/**
 * Joplin Note type definition
 * Based on: https://joplinapp.org/help/api/references/rest_api/#notes
 */
export interface Note {
  /** Note ID */
  id: string;

  /** ID of the notebook that contains this note. Change this ID to move the note to a different notebook. */
  parent_id: string;

  /** The note title */
  title: string;

  /** The note body, in Markdown. May also contain HTML. */
  body: string;

  /** When the note was created (Unix timestamp in milliseconds) */
  created_time: number;

  /** When the note was last updated (Unix timestamp in milliseconds) */
  updated_time: number;

  /** Tells whether the note is a conflict or not (0 or 1) */
  is_conflict: number;

  /** Latitude */
  latitude?: number;

  /** Longitude */
  longitude?: number;

  /** Altitude */
  altitude?: number;

  /** Author */
  author?: string;

  /** The full URL where the note comes from */
  source_url?: string;

  /** Tells whether this note is a todo or not (0 or 1) */
  is_todo: number;

  /** When the todo is due. An alarm will be triggered on that date (Unix timestamp in milliseconds) */
  todo_due?: number;

  /** Tells whether todo is completed or not. This is a timestamp in milliseconds. */
  todo_completed?: number;

  /** Source */
  source?: string;

  /** Source application */
  source_application?: string;

  /** Application data */
  application_data?: string;

  /** Order */
  order?: number;

  /** When the note was created. It may differ from created_time as it can be manually set by the user. */
  user_created_time: number;

  /** When the note was last updated. It may differ from updated_time as it can be manually set by the user. */
  user_updated_time: number;

  /** Encryption cipher text */
  encryption_cipher_text?: string;

  /** Encryption applied (0 or 1) */
  encryption_applied: number;

  /** Markup language (1 for Markdown, 2 for HTML) */
  markup_language: number;

  /** Whether the note is published (0 or 1) */
  is_shared: number;

  /** The ID of the Joplin Server/Cloud share containing the note. Empty if not shared. */
  share_id?: string;

  /** Conflict original ID */
  conflict_original_id?: string;

  /** Master key ID */
  master_key_id?: string;

  /** User data */
  user_data?: string;

  /** Deleted time (Unix timestamp in milliseconds) */
  deleted_time?: number;

  /** Note body, in HTML format (when creating/updating notes) */
  body_html?: string;

  /** Base URL for relative URLs in body_html */
  base_url?: string;

  /** An image to attach to the note, in Data URL format */
  image_data_url?: string;

  /** Rectangle for cropping image: { x: x, y: y, width: width, height: height } */
  crop_rect?: string;
}
