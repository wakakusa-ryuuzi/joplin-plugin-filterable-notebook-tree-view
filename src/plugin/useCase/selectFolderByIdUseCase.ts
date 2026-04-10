
import { openFolderById } from '../../plugin/gateway/folder';

export class SelectFolderByIdUseCase {
  async execute(folderId: string): Promise<void> {
    await openFolderById(folderId);
  }
}
