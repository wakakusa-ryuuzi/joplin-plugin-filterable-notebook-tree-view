import { NotifyMessageType, RequestMessageType } from '../../share/types';
import { Logger } from '../../share/logger';
import { FolderPanelUseCase } from '../usecase/folderPanelUseCase';

// TODO: ユースケース分離したのでcommandフォルダ切る意味あるか検討　panel以外のコマンド有りうる？

/**
 * フォルダ取得要求メッセージ
 */
interface GetFoldersMessage {
  type: typeof RequestMessageType.GetFolders;
}

/**
 * フォルダ選択要求メッセージ
 */
interface SelectFolderMessage {
  type: typeof RequestMessageType.SelectFolder;
  folderId?: string;
}

/**
 * webviewからのメッセージ型
 */
type RequestMessage = GetFoldersMessage | SelectFolderMessage;

type PostMessage = (message: { type: string; folders?: unknown[] }) => Promise<void>;

function isMessagePayload(rawMessage: unknown): rawMessage is RequestMessage {
  const payload = rawMessage as Record<string, unknown> | null;
  if (payload === null || typeof payload !== 'object') {
    return false;
  }

  return typeof payload.type === 'string';
}

/**
 * webviewからのメッセージハンドラ
 * @description パネルからのコマンドを処理する、 `PanelBridge.onMessage` 用
 *
 * @param rawMessage webviewから受け取ったメッセージ（未Validation）
 * @param postMessage webviewにメッセージを送信する関数
 * @returns 無し
 */
export async function handlePanelCommand(rawMessage: unknown, postMessage: PostMessage): Promise<void> {
  if (!isMessagePayload(rawMessage)) {
    Logger.warn('Invalid panel message payload', rawMessage);
    return;
  }

  const message = rawMessage;

  switch (message.type) {
    case RequestMessageType.GetFolders: {
      const folderTree = await FolderPanelUseCase.getTreeFolders();
      await postMessage({ type: NotifyMessageType.UpdateFolderList, folders: folderTree });
      return;
    }
    case RequestMessageType.SelectFolder: {
      if (!message.folderId) {
        Logger.warn('SelectFolder command missing folderId', message);
        return;
      }
      await FolderPanelUseCase.selectFolderById(message.folderId);
      return;
    }
    default: {
      Logger.warn('Unknown panel command', message);
      return;
    }
  }
}
