import { TreeFolder } from '../../share/types';
import { FolderSortOrderField } from '../../share/types';

import { getAllFolders, getFolderSortOrder, getLastNoteUpdatedTimeByFolderId } from '../gateway/folder';
import { toTreeFolderTree } from '../logic/folder';

export class GetTreeFoldersUseCase {
  async execute(): Promise<TreeFolder[]> {
    const folders = await getAllFolders();
    const sortOrder = await getFolderSortOrder();
    const lastNoteUpdatedByFolderId =
      sortOrder.field === FolderSortOrderField.LastNoteUserUpdatedTime
        ? await getLastNoteUpdatedTimeByFolderId()
        : undefined;

    return toTreeFolderTree(folders, sortOrder, lastNoteUpdatedByFolderId);
  }
}

