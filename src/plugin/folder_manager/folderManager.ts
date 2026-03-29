import joplin from 'api';

import { Folder, FolderIcon, PaginatedResponse } from '../joplin';
import { TreeFolder } from '../../share/types';

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
   * コマンド用　Get all folders from Joplin
   */
  static async getAllFolders(): Promise<Folder[]> {
    Logger.info('Getting all folders...');

    try {
      const allFolders: Folder[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response: PaginatedResponse<Folder> = await joplin.data.get(['folders'], { fields: ['id', 'title', 'parent_id', 'icon'], page });

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

  /**
   * コマンド用　Convert folder tree into TreeFolder with basic validation.
   */
  static toTreeFolderTree(folders: Folder[]): TreeFolder[] {
    const folderTree = this.buildFolderTree(folders);
    const result: TreeFolder[] = [];

    for (const node of folderTree) {
      const converted = this.toTreeFolder(node);
      if (converted) {
        result.push(converted);
      }
    }

    return result;
  }

  /**
   * コマンド用
   *
   * @param id
   */
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


  private static toTreeFolder(node: Folder): TreeFolder | null {
    if (!node.id || !node.title) {
      Logger.warn('Skipping folder with missing id or title', { id: node.id, title: node.title });
      return null;
    }

    const children: TreeFolder[] = [];
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const converted = this.toTreeFolder(child);
        if (converted) {
          children.push(converted);
        }
      }
    }

    return {
      id: node.id,
      title: node.title,
      icon: this.extractFolderIcon(node.icon),
      parent_id: node.parent_id,
      children,
    };
  }

  /**
   * Folder → TreeNode変換時用 Extracts the folder icon from the given icon string.
   *
   * @param icon The icon string, which can be a JSON string representing a FolderIcon or a plain string.
   * @returns 取得できるemojiを直接（なければundefined）
   */
  private static extractFolderIcon(icon?: string): string | undefined {
    if (!icon) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(icon) as FolderIcon | string;
      if (typeof parsed === 'string') {
        return parsed;
      }
      if (parsed && typeof parsed === 'object' && typeof parsed.emoji === 'string') {
        return parsed.emoji;
      }
    } catch (error) {
      Logger.warn('Failed to parse folder icon JSON', { icon, error });
    }

    return undefined;
  }
}
