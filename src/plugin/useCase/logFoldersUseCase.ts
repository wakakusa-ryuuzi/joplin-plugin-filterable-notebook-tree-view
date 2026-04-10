import { Folder } from '../joplin';

import { Logger } from '../../share/logger';

import { getAllFolders } from '../gateway/folder';

export class LogFoldersUseCase {
  async execute(): Promise<void> {
    try {
      const folders = await getAllFolders();
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
}
