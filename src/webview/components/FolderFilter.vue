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
      const lowered = filterText.toLowerCase();
      const childrenByParent = new Map();
      for (const folder of allFolders.value) {
        if (!childrenByParent.has(folder.parent_id)) {
          childrenByParent.set(folder.parent_id, []);
        }
        childrenByParent.get(folder.parent_id).push(folder);
      }

      const matchedIds = new Set(
        allFolders.value
          .filter(folder => folder.title.toLowerCase().includes(lowered))
          .map(folder => folder.id)
      );

      const includeIds = new Set(matchedIds);
      const queue = Array.from(matchedIds);
      while (queue.length > 0) {
        const parentId = queue.shift();
        const children = childrenByParent.get(parentId) || [];
        for (const child of children) {
          if (!includeIds.has(child.id)) {
            includeIds.add(child.id);
            queue.push(child.id);
          }
        }
      }

      filteredFolders.value = allFolders.value.filter(folder => includeIds.has(folder.id));
    } else {
      filteredFolders.value = [...allFolders.value];
    }
    addDebugMessage(`表示フォルダ数: ${filteredFolders.value.length}`);
  };

  function openSelectedFolder(folderId) {
    const targetId = folderId || selectedFolderId.value;
    if (targetId) {
      addDebugMessage(`フォルダ選択: ${targetId}`);
      window.webviewApi.postMessage({
        type: 'selectFolder',
        folderId: targetId,
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
  <div class="h-screen pa-2 flex flex-col overflow-y-auto">
    <!-- 絞り込みテキスト入力 -->
    <div class="relative mb-2">
      <input
        v-model="filterText"
        type="text"
        placeholder="Notebook name"
        @input="handleFilterChange"
        class="w-full pa-2 pr-8 box-border border border-gray-300 rounded"
      />
      <button
        v-if="filterText"
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2
              w-5 h-5
              grid place-items-center
              rounded-full
              bg-gray-200 text-gray-500
              hover:bg-gray-300 hover:text-gray-700
              active:scale-90
              transition-all duration-150"
        @click="filterText = ''; handleFilterChange();"
      >
        <span class="i-mdi:window-close text-sm"></span>
      </button>
    </div>

    <!-- フォルダツリー (ボタン) -->
    <div class="w-full flex-1 pa-2 box-border border border-gray-300 rounded overflow-y-auto">
      <div v-if="filteredFolders.length === 0" class="pa-2 text-gray-500">
        {{ allFolders.length === 0 ? '読み込み中...' : '該当するフォルダがありません' }}
      </div>
      <button
        v-for="folder in filteredFolders"
        :key="folder.id"
        type="button"
        class="w-full text-left pa-1 rounded hover:bg-gray-100"
        :style="{ paddingLeft: `${getIndentLevel(folder) * 16 + 8}px` }"
        @click="openSelectedFolder(folder.id)"
      >
        📁 {{ folder.title }}
      </button>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}
</style>
