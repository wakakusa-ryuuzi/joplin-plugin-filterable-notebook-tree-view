import joplin from 'api';

import { Logger } from '../utils/Logger';

export class PanelManager {
  static async createPanel(){
    return await joplin.views.panels.create('folderFilterPanel');
  }

  static async initPanel(panel){

    const isDev = process.env.NODE_ENV === 'development';

    const html = '<div id="app"></div>';

    await joplin.views.panels.setHtml(panel, html);

    if (isDev) {
      await joplin.views.panels.addScript(panel, './dev-webview.js');
    } else {
      await joplin.views.panels.addScript(panel, './webview/webview.js');
    }
  }
}
