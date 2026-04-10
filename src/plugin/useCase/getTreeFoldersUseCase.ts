import { TreeFolder } from '../../share/types';

import { getAllFolders, getFolderSortOrder } from '../gateway/folder';
import { toTreeFolderTree } from '../logic/folder';

export class GetTreeFoldersUseCase {
  async execute(): Promise<TreeFolder[]> {
    const folders = await getAllFolders();
    const sortOrder = await getFolderSortOrder();
    return toTreeFolderTree(folders, sortOrder);
  }
}

