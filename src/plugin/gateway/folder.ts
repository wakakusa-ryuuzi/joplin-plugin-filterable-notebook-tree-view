import joplin from 'api';

import { Folder, PaginatedResponse } from '../joplin';

import { FolderSortOrder, FolderSortOrderField } from '../../share/types';
import { Logger } from '../../share/logger';



// TODO: コレ移動できるかも
/** ソート情報のエラー時用デフォルト値 */
const DEFAULT_FOLDER_SORT_ORDER: FolderSortOrder = {
  field: FolderSortOrderField.Title,
  reverse: false,
};

function normalizeFolderSortOrder(fieldRaw: unknown, reverseRaw: unknown): FolderSortOrder {
  const isKnownField =
    fieldRaw === FolderSortOrderField.Title ||
    fieldRaw === FolderSortOrderField.CreatedTime ||
    fieldRaw === FolderSortOrderField.UpdatedTime;

  if (!isKnownField) {
    Logger.warn('Unknown folder sort order field. Fallback to title.', { fieldRaw });
  }

  if (typeof reverseRaw !== 'boolean') {
    Logger.warn('Invalid folder sort reverse flag. Fallback to false.', { reverseRaw });
  }

  return {
    field: isKnownField ? fieldRaw : DEFAULT_FOLDER_SORT_ORDER.field,
    reverse: typeof reverseRaw === 'boolean' ? reverseRaw : DEFAULT_FOLDER_SORT_ORDER.reverse,
  };
}

/**
 * フォルダのソート順を取得
 *
 * @returns フォルダのソート順設定
 */
export async function getFolderSortOrder(): Promise<FolderSortOrder> {
  try {
    const [fieldRaw, reverseRaw] = await joplin.settings.globalValues([
      'folders.sortOrder.field',
      'folders.sortOrder.reverse',
    ]);

    const order = normalizeFolderSortOrder(fieldRaw, reverseRaw);
    Logger.info('Folder sort order settings', order);

    return order;

  } catch (error) {
    Logger.warn('Failed to load folder sort order settings. Using defaults.', { error });

    return DEFAULT_FOLDER_SORT_ORDER;
  }
}

/**
 * 全フォルダを取得
 *
 * @returns 全のフォルダの配列（joplinの型）
 */
export async function getAllFolders(): Promise<Folder[]> {
  Logger.info('Getting all folders...');

  try {
    const allFolders: Folder[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response: PaginatedResponse<Folder> = await joplin.data.get(['folders'], {
        fields: ['id', 'title', 'parent_id', 'icon', 'created_time', 'updated_time'],
        page,
      });

      if (response.items && response.items.length > 0) {
        allFolders.push(...response.items);
      }

      hasMore = response.has_more;
      page += 1;
    }

    Logger.info(`Found ${allFolders.length} folders`);
    Logger.info(`folders:  ${JSON.stringify(allFolders)}`);

    return allFolders;

  } catch (error) {
    Logger.error('Failed to get folders', error);
    return [];
  }
}

/**
 * フォルダを開く
 *
 * @param id フォルダのID
 */
export async function openFolderById(id: string): Promise<void> {
  Logger.info(`Attempting to open folder: ${id}`);

  try {
    Logger.info(`Opening folder with ID: ${id}`);

    await joplin.commands.execute('openFolder', id);
    Logger.info(`Folder opened: ${id}`);

  } catch (error) {
    Logger.error(`Failed to open folder with ID ${id}`, error);
  }
}

/**
 * IDからフォルダを取得
 *
 * @param id フォルダのID
 * @returns フォルダ（joplinの型）、取得に失敗した場合はnull
 */
export async function getFolderById(id: string): Promise<Folder | null> {
  try {
    Logger.info(`Fetching folder with ID: ${id}`);

    const folder: Folder = await joplin.data.get(['folders', id]);
    Logger.info(`Retrieved folder: ${folder.title}`);

    return folder;
  } catch (error) {
    Logger.error(`Failed to get folder with ID ${id}`, error);

    return null;
  }
}
