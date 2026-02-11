/**
 * Joplin Data API type definitions
 * Based on: https://joplinapp.org/help/api/references/rest_api/
 */

export { Note } from './Note';
export { Folder } from './Folder';
export { Tag } from './Tag';
export { Resource } from './Resource';
export { PaginatedResponse } from './PaginatedResponse';

/**
 * Item type IDs used in Joplin API
 * Based on: https://joplinapp.org/help/api/references/rest_api/#item-type-ids
 */
export enum ItemType {
  Note = 1,
  Folder = 2,
  Setting = 3,
  Resource = 4,
  Tag = 5,
  NoteTag = 6,
  Search = 7,
  Alarm = 8,
  MasterKey = 9,
  ItemChange = 10,
  NoteResource = 11,
  ResourceLocalState = 12,
  Revision = 13,
  Migration = 14,
  SmartFilter = 15,
  Command = 16,
}
