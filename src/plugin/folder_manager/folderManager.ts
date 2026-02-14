import joplin from 'api';

import { Folder, PaginatedResponse } from '../joplin';

import { Logger } from '../../share/logger';


/**
 * Manages folder operations for the plugin
 */
export class FolderManager {

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
   * Get all folders from Joplin
   */
  static async getAllFolders(): Promise<Folder[]> {
    Logger.info('Getting all folders...');

    try {
      const allFolders: Folder[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response: PaginatedResponse<Folder> = await joplin.data.get(['folders'], { page });

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
   * Build a tree structure from a flat folder list.
   * The order of children follows the input list order for stability.
   */
  static buildFolderTree(folders: Folder[]): Folder[] {
    const nodesById = new Map<string, Folder>();
    const roots: Folder[] = [];

    for (const folder of folders) {
      nodesById.set(folder.id, { ...folder, children: [] });
    }

    for (const folder of folders) {
      const node = nodesById.get(folder.id);
      if (!node) {
        continue;
      }

      if (folder.parent_id && nodesById.has(folder.parent_id)) {
        const parent = nodesById.get(folder.parent_id);
        parent?.children?.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
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
}
