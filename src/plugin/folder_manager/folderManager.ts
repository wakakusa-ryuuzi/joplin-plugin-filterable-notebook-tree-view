import joplin from 'api';

import { Folder, PaginatedResponse } from '../joplin';

import { Logger } from '../../share/logger';


/**
 * Manages folder operations for the plugin
 */
export class FolderManager {
  /**
   * Get all folders from Joplin
   */
  static async getAllFolders(): Promise<Folder[]> {
    Logger.info('Getting all folders...');

    try {
      const response: PaginatedResponse<Folder> = await joplin.data.get(['folders']);
      Logger.info(`Found ${response.items?.length || 0} folders`);
      Logger.info(`folders:  ${JSON.stringify(response.items)}`);

      return response.items || [];
    } catch (error) {
      Logger.error('Failed to get folders', error);
      return [];
    }
  }

  static async openFolderById(id: string): Promise<void> {
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
   * Get a specific folder by ID
   */
  static async getFolderById(id: string): Promise<Folder | null> {
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

  /**
   * Log folder information
   */
  static async logFolders(): Promise<void> {
    try {
      const folders = await this.getAllFolders();
      Logger.info('=== Folder List ===');
      folders.forEach((folder: Folder) => {
        Logger.info(`📁 ${folder.title}`);
        Logger.info(`  ID: ${folder.id}`);
        Logger.info(`  Parent ID: ${folder.parent_id || 'none'}`);
        Logger.info(`  Created Time: ${new Date(folder.created_time).toLocaleString()}`);
        Logger.info(`  Updated Time: ${new Date(folder.updated_time).toLocaleString()}`);
        Logger.info(`  User Created Time: ${new Date(folder.user_created_time).toLocaleString()}`);
        Logger.info(`  User Updated Time: ${new Date(folder.user_updated_time).toLocaleString()}`);
        Logger.info(`  Encryption Applied: ${folder.encryption_applied ? 'Yes' : 'No'}`);
        Logger.info(`  Encryption Cipher Text: ${folder.encryption_cipher_text || 'none'}`);
        Logger.info(`  Is Shared: ${folder.is_shared ? 'Yes' : 'No'}`);
        Logger.info(`  Share ID: ${folder.share_id || 'none'}`);
        Logger.info(`  Master Key ID: ${folder.master_key_id || 'none'}`);
        Logger.info(`  Icon: ${folder.icon || 'none'}`);
        Logger.info(`  User Data: ${folder.user_data || 'none'}`);
        Logger.info(`  Deleted Time: ${folder.deleted_time ? new Date(folder.deleted_time).toLocaleString() : 'none'}`);
        Logger.info(`  Children Count: ${folder.children?.length || 0}`);
      });
      Logger.info('=== End Folder List ===');
    } catch (error) {
      Logger.error('Failed to log folders', error);
    }
  }

  /**
   * Filter folders by title (case-insensitive)
   * Returns matching folders and their children
   */
  static filterFolders(folders: Folder[], filterText: string): Folder[] {
    if (!filterText || filterText.trim() === '') {
      return folders;
    }

    const lowerFilterText = filterText.toLowerCase();
    const matchingFolders = new Set<string>();

    // 1. マッチするフォルダを見つける
    folders.forEach((folder: Folder) => {
      if (folder.title.toLowerCase().includes(lowerFilterText)) {
        matchingFolders.add(folder.id);
      }
    });

    // 2. マッチしたフォルダの子供を追加
    const addChildren = (parentId: string) => {
      folders.forEach((folder: Folder) => {
        if (folder.parent_id === parentId && !matchingFolders.has(folder.id)) {
          matchingFolders.add(folder.id);
          addChildren(folder.id); // 再帰的に子供を追加
        }
      });
    };

    matchingFolders.forEach(folderId => {
      addChildren(folderId);
    });

    // 3. マッチしたフォルダの親も追加（階層表示のため）
    const addParents = (folderId: string) => {
      const folder = folders.find(f => f.id === folderId);
      if (folder && folder.parent_id && !matchingFolders.has(folder.parent_id)) {
        matchingFolders.add(folder.parent_id);
        addParents(folder.parent_id);
      }
    };

    matchingFolders.forEach(folderId => {
      addParents(folderId);
    });

    // 4. フィルタリングされたフォルダを返す
    return folders.filter(folder => matchingFolders.has(folder.id));
  }
}
