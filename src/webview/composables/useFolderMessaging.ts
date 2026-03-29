import { Logger } from '../../share/logger';
import {
  NotifyMessageType,
  RequestMessageType,
  TreeFolder,
} from '../../share/types';

type MessagePayload = {
  type?: string;
  folders?: TreeFolder[];
  message?: MessagePayload;
};

/**
 * 受信したメッセージのバリデート的な奴
 *
 * @param message 受信したメッセージ（型不明）
 * @returns こっちの型にしたやつ
 */
function resolveMessagePayload(message: unknown): MessagePayload {
  if (typeof message !== 'object' || message === null) {
    return {};
  }

  const payload = message as MessagePayload;
  return payload.message && typeof payload.message === 'object'
    ? payload.message
    : payload;
}

/**
 * `window.webviewApi`が利用可能かどうかを確認
 *
 * @returns boolean（利用可能な場合true）
 */
function isWebviewApiAvailable(): boolean {
  if (!window.webviewApi) {
    Logger.error('not find webviewApi');
    return false;
  }
  return true;
}

export function useFolderMessaging() {
  /**
   * メッセージラッパー：フォルダツリーのリクエストを送信
   *
   * @returns void
   */
  function requestFolderTree(): void {
    if (!isWebviewApiAvailable()) {
      return;
    }

    Logger.debug('Sending folder list request');
    try {
      window.webviewApi.postMessage({ type: RequestMessageType.GetFolders });
      Logger.debug('Folder list request sent successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Logger.error(message);
    }
  }

  /**
   * メッセージラッパー：フォルダ選択のリクエストを送信
   *
   * @param folderId 選択するフォルダのID
   * @returns void
   */
  function selectFolder(folderId: string): void {
    if (!isWebviewApiAvailable()) {
      return;
    }

    window.webviewApi.postMessage({
      type: RequestMessageType.SelectFolder,
      folderId,
    });
  }

  /**
   * plugin側からのメッセージを購読登録
   *
   * @param onUpdate フォルダリスト更新時のコールバック
   * @returns void
   */
  function registerFolderListListener(onUpdate: (folders: TreeFolder[]) => void): void {
    if (!isWebviewApiAvailable()) {
      return;
    }

    window.webviewApi.onMessage((message: unknown) => {
      const messagePayload = resolveMessagePayload(message);
      Logger.debug(`Message received: ${messagePayload.type ?? 'unknown'}`);

      if (messagePayload.type === NotifyMessageType.UpdateFolderList) {
        onUpdate(messagePayload.folders || []);
      }
    });
  }

  return {
    requestFolderTree,
    selectFolder,
    registerFolderListListener,
  };
}
