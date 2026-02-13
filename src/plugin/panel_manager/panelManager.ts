import joplin from 'api';

import { Logger } from '../utils/Logger';

// Vueビルド結果のHTM
import webviewHtml from '../../webview/webview.html';

export class PanelManager {
  static async createPanel(){
    return await joplin.views.panels.create('folderFilterPanel');
  }

  static async initPanel(panel){

    // webview スクリプトをロード
    // 開発時：Viteのdevserverを参照（localhost:5173）
    // 本番時：ビルド済みのスクリプトを参照（./webview.js）
    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) {
      Logger.info('Development mode: Loading from Vite dev server');
      // 開発時：devserver から module を読み込む
      await joplin.views.panels.setHtml(panel, webviewHtml);
      await joplin.views.panels.addScript(panel, './dev-webview.js');
    } else {
      Logger.info('Production mode: Loading built webview.js');
      // 本番時：ビルド済みのスクリプトを読み込む
      await joplin.views.panels.addScript(panel, './webview.js');
    }
  }
}
