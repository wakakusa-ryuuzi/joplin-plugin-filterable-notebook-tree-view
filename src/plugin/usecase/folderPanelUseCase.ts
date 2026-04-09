import { TreeFolder } from '../../share/types';
import { FolderRepository } from '../folder/folderRepository';
import { toTreeFolderTree } from '../folder/folderTreeMapper';

// TODO: クラスに分離（FolderPanelでもない思うので）
export class FolderPanelUseCase {
  static async getTreeFolders(): Promise<TreeFolder[]> {
    const folders = await FolderRepository.getAllFolders();
    return toTreeFolderTree(folders);
  }

  static async selectFolderById(folderId: string): Promise<void> {
    await FolderRepository.openFolderById(folderId);
  }
}
