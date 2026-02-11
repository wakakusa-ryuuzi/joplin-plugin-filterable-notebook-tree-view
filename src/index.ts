import joplin from 'api';
import { Logger } from './utils/Logger';
import { FolderManager } from './utils/FolderManager';

// Vueビルド結果のHTMLを読み込む
import webviewHtml from './webview.html';

joplin.plugins.register({
	onStart: async function() {
		Logger.info('Plugin started');
		
		// Step 2: フォルダ一覧を取得してログ出力
		await FolderManager.logFolders();
		
		// Step 3: カスタムパネルを作成
		const panel = await joplin.views.panels.create('folderFilterPanel');
		
		// webview.htmlの内容を設定
		await joplin.views.panels.setHtml(panel, webviewHtml);
		
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
		
		// パネルからのメッセージを処理
		joplin.views.panels.onMessage(panel, async (message) => {
			Logger.info('Received message from panel:', JSON.stringify(message));
			
			if (message.type === 'getFolders') {
				Logger.info('Getting all folders...');
				// 全フォルダを取得して送信
				const folders = await FolderManager.getAllFolders();
				Logger.info(`Sending ${folders.length} folders to panel`);
				Logger.info(`folders:  ${JSON.stringify(folders)}`);
				await joplin.views.panels.postMessage(panel, { type: 'updateFolderList', folders });
			}
			
			if (message.type === 'selectFolder') {
				// フォルダを選択（実際にJoplinのフォルダを開く）
				Logger.info(`Attempting to open folder: ${message.folderId}`);
				try {
					// Joplinの組み込みコマンドを使用してフォルダを開く
					await joplin.commands.execute('openFolder', message.folderId);
					Logger.info(`Folder selected: ${message.folderId}`);
				} catch (error) {
					Logger.error('Failed to select folder', error);
				}
			}
		});
		
		Logger.info('Folder filter panel created successfully');
	},
});

