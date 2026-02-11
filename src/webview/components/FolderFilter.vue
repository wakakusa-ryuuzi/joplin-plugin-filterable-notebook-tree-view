<script setup lang="ts">
  import { onMounted, ref } from 'vue';

  const allFolders = ref([]);
  const filteredFolders = ref([]);
  const filterText = ref('');
  const selectedFolderId = ref('');
  const debugMessages = ref(['スクリプト初期化中...']);

  onMounted(() => {
    addDebugMessage('Vue コンポーネントマウント完了');
    addDebugMessage(`webviewApi: ${typeof window.webviewApi}`);

    if (!window.webviewApi) {
      addDebugMessage('エラー: webviewApi が見つかりません');
      return;
    }

    addDebugMessage('フォルダリスト取得要求を送信');
    window.webviewApi.postMessage({ type: 'getFolders' }).then(() => {
      addDebugMessage('フォルダリスト取得要求送信完了');
    }).catch(err => {
      addDebugMessage(`エラー: ${err.message}`);
    });

    // プラグインからのメッセージを受信
    window.webviewApi.onMessage((message) => {
      addDebugMessage(`メッセージ内容: ${JSON.stringify(message)}`);

      const messagePayload = message.message || message;
      addDebugMessage(`メッセージ受信: ${messagePayload.type}`);
      
      if (messagePayload.type === 'updateFolderList') {
        allFolders.value = messagePayload.folders || [];
        addDebugMessage(`フォルダ数: ${allFolders.value.length}`);
        handleFilterChange();
      }
    });

    addDebugMessage('Vue初期化完了');
  });


  function addDebugMessage(message) {
    const timestamp = new Date().toLocaleTimeString();
    debugMessages.value.push(`[${timestamp}] ${message}`);
    // 最新100件のみ保持
    if (debugMessages.value.length > 100) {
      debugMessages.value.shift();
    }
  };

  function handleFilterChange() {
    addDebugMessage(`フィルタ適用: "${filterText.value}"`);
    filterAndDisplayFolders(filterText.value);
  };

  function filterAndDisplayFolders(filterText) {
    if (filterText) {
      filteredFolders.value = allFolders.value.filter(folder =>
        folder.title.toLowerCase().includes(filterText)
      );
    } else {
      filteredFolders.value = [...allFolders.value];
    }
    addDebugMessage(`表示フォルダ数: ${filteredFolders.value.length}`);
  };

  function openSelectedFolder() {
    if (selectedFolderId.value) {
      addDebugMessage(`フォルダ選択: ${selectedFolderId.value}`);
      window.webviewApi.postMessage({
        type: 'selectFolder',
        folderId: selectedFolderId.value,
      });
    } else {
      addDebugMessage('エラー: フォルダが選択されていません');
    }
  };

  function getIndentLevel(folder) {
    let level = 0;
    let currentFolder = folder;
    while (currentFolder.parent_id) {
      level++;
      currentFolder = allFolders.value.find(f => f.id === currentFolder.parent_id);
      if (!currentFolder) break;
    }
    return level;
  };

</script>

<template>
  <div style="padding: 10px; font-family: sans-serif;">
    <h3 style="margin-top: 0;">📁 フォルダフィルタ</h3>

    <!-- デバッグメッセージ表示エリア -->
    <div
      id="debugMessages"
      style="
        background: #f0f0f0;
        padding: 8px;
        margin-bottom: 10px;
        border-radius: 4px;
        font-size: 11px;
        max-height: 100px;
        overflow-y: auto;
        font-family: monospace;
      "
    >
      <div v-for="(msg, index) in debugMessages" :key="index">
        {{ msg }}
      </div>
    </div>

    <!-- 絞り込みテキスト入力 -->
    <input
      v-model="filterText"
      type="text"
      placeholder="フォルダ名で絞り込み..."
      @input="handleFilterChange"
      style="
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 4px;
      "
    />

    <!-- フォルダプルダウン -->
    <select
      v-model="selectedFolderId"
      size="15"
      style="
        width: 100%;
        padding: 8px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-family: sans-serif;
      "
    >
      <option v-if="filteredFolders.length === 0" value="">
        {{ allFolders.length === 0 ? '読み込み中...' : '該当するフォルダがありません' }}
      </option>
      <option v-for="folder in filteredFolders" :key="folder.id" :value="folder.id">
        {{ ' '.repeat(getIndentLevel(folder) * 2) }}📁 {{ folder.title }}
      </option>
    </select>

    <button
      @click="openSelectedFolder"
      style="
        margin-top: 10px;
        padding: 8px 16px;
        width: 100%;
        background: #007acc;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      "
    >
      選択したフォルダを開く
    </button>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}
</style>