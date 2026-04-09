import joplin from 'api';

declare const process: { env?: { NODE_ENV?: string } };

export class PanelBridge {
  static async createPanel() {
    return await joplin.views.panels.create('folderFilterPanel');
  }

  static async initPanel(panel: string) {

    const isDev = process.env?.NODE_ENV === 'development';

    const html = '<div id="app"></div>';

    await joplin.views.panels.setHtml(panel, html);

    if (isDev) {
      await joplin.views.panels.addScript(panel, './dev-webview.js');
    } else {
      await joplin.views.panels.addScript(panel, './webview/webview.js');
    }
  }

  static onMessage(panel: string, handler: (message: unknown) => Promise<void>): void {
    joplin.views.panels.onMessage(panel, handler);
  }

  static async postMessage(panel: string, message: unknown): Promise<void> {
    await joplin.views.panels.postMessage(panel, message);
  }
}
