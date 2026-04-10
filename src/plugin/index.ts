import joplin from '../../api';

import { Logger } from '../share/logger';

import { LogFoldersUseCase } from './useCase/logFoldersUseCase';
import { PanelBridge } from './panel/panelBridge';
import { handlePanelCommand } from './command/panelCommandRouter';

declare const process: { env?: { NODE_ENV?: string } };


joplin.plugins.register({
  onStart: async function () {
    Logger.info('Plugin started');

    if (process.env?.NODE_ENV === 'development') {
      await new LogFoldersUseCase().execute();
    }

    // パネルの作成と初期化
    const panel = await PanelBridge.createPanel();
    await PanelBridge.initPanel(panel);

    // パネルからのメッセージを登録
    PanelBridge.onMessage(panel, async (message: unknown) => {
      Logger.info('Received message from panel:', JSON.stringify(message));

      await handlePanelCommand(message, (payload) => PanelBridge.postMessage(panel, payload));
    });
  },
});

