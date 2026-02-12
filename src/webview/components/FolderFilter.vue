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
        console.log('Received folders:', allFolders.value);
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
  <div class="h-screen pa-2 flex flex-col overflow-y-auto bg-red">
    <!-- 絞り込みテキスト入力 -->
    <input
      v-model="filterText"
      type="text"
      placeholder="Notebook name"
      @input="handleFilterChange"
      class="w-full pa-2 mb-2 box-border border border-gray-300 rounded"
    />

    <!-- フォルダプルダウン -->
    <select
      v-model="selectedFolderId"
      size="15"
      class="w-full flex-1 pa-2 box-border border border-gray-300 rounded"
    >
      <option v-if="filteredFolders.length === 0" value="">
        {{ allFolders.length === 0 ? '読み込み中...' : '該当するフォルダがありません' }}
      </option>
      <option v-for="folder in filteredFolders" :key="folder.id" :value="folder.id">
        {{ ' '.repeat(getIndentLevel(folder) * 2) }}📁 {{ folder.title }}
      </option>
    </select>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}
</style>
