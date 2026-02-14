import joplin from '../../api';

import { FolderManager } from './folder_manager/folderManager';
import { PanelManager } from './panel_manager/panelManager';
import { RequestMessageType } from '../share/types';
import { Logger } from '../share/logger';


joplin.plugins.register({
  onStart: async function() {
    Logger.info('Plugin started');

    if(process.env.NODE_ENV === 'development') {
      await FolderManager.logFolders();
    }

    // パネルの作成と初期化
    const panel = await PanelManager.createPanel();
    await PanelManager.initPanel(panel);

    // パネルからのメッセージを処理
    joplin.views.panels.onMessage(panel, async (message) => {
      Logger.info('Received message from panel:', JSON.stringify(message));

      // HACK: messageが増えたらswitch文ごと別にする？
      switch(message.type) {
        case RequestMessageType.GetFolders:
          const folders = await FolderManager.getAllFolders();
          await joplin.views.panels.postMessage(panel, { type: 'updateFolderList', folders });
          break;
        case RequestMessageType.SelectFolder:
          await FolderManager.openFolderById(message.folderId);
          break;
      }
    });
  },
});

