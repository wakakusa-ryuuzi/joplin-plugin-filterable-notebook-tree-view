import { Folder, FolderIcon } from '../joplin';

import { FolderSortOrder, FolderSortOrderField, TreeFolder } from '../../share/types';
import { Logger } from '../../share/logger';


// TODO: 元から木構造で取れたかもしれない…

/**
 * Folder配列を、再帰的に探索し、TreeFolder型に変換
 *
 * @param folders フラットなフォルダ配列（joplinから取れる型）
 * @returns Tree化したフォルダ
 */
export function toTreeFolderTree(folders: Folder[], sortOrder?: FolderSortOrder): TreeFolder[] {
  const folderTree = buildFolderTree(folders, sortOrder);
  const result: TreeFolder[] = [];

  for (const node of folderTree) {
    const converted = toTreeFolder(node);
    if (converted) {
      result.push(converted);
    }
  }

  return result;
}

/**
 * フラットなフォルダ配列を、ツリー構造に変換する（構造変換）
 *
 * @param folders フラットなフォルダ配列（joplinから取れる型）
 * @returns ツリー構造のフォルダ配列
 */
function buildFolderTree(folders: Folder[], sortOrder?: FolderSortOrder): Folder[] {
  const nodesById = new Map<string, Folder>();
  const roots: Folder[] = [];

  for (const folder of folders) {
    nodesById.set(folder.id, { ...folder, children: [] });
  }

  for (const folder of folders) {
    const node = nodesById.get(folder.id);
    if (!node) {
      continue;
    }

    if (folder.parent_id && nodesById.has(folder.parent_id)) {
      const parent = nodesById.get(folder.parent_id);
      parent?.children?.push(node);
    } else {
      roots.push(node);
    }
  }

  sortFoldersByOrder(roots, sortOrder);
  for (const root of roots) {
    sortChildrenRecursively(root, sortOrder);
  }

  return roots;
}

function sortChildrenRecursively(node: Folder, sortOrder?: FolderSortOrder): void {
  if (!node.children || node.children.length === 0) {
    return;
  }

  sortFoldersByOrder(node.children, sortOrder);

  for (const child of node.children) {
    sortChildrenRecursively(child, sortOrder);
  }
}

function sortFoldersByOrder(folders: Folder[], sortOrder?: FolderSortOrder): void {
  folders.sort((a, b) => compareFolders(a, b, sortOrder));
}

function compareFolders(a: Folder, b: Folder, sortOrder?: FolderSortOrder): number {
  const order = sortOrder ?? {
    field: FolderSortOrderField.Title,
    reverse: false,
  };

  let result = 0;

  if (order.field === FolderSortOrderField.CreatedTime) {
    result = compareNumber(a.created_time, b.created_time);
  } else if (order.field === FolderSortOrderField.UpdatedTime) {
    result = compareNumber(a.updated_time, b.updated_time);
  } else {
    result = (a.title ?? '').localeCompare(b.title ?? '', undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  }

  if (result === 0) {
    result = (a.id ?? '').localeCompare(b.id ?? '');
  }

  return order.reverse ? -result : result;
}

function compareNumber(a?: number, b?: number): number {
  const left = typeof a === 'number' ? a : 0;
  const right = typeof b === 'number' ? b : 0;
  return left - right;
}

/**
 * ツリー構造のフォルダ配列を、TreeFolder型に変換（型変換）
 *
 * @param node フォルダノード（buildFolderTreeで作成したアイテムアイテム）
 * @returns 引数の子以下のツリー（子がいない場合null）
 */
function toTreeFolder(node: Folder): TreeFolder | null {
  if (!node.id || !node.title) {
    Logger.warn('Skipping folder with missing id or title', { id: node.id, title: node.title });
    return null;
  }

  const children: TreeFolder[] = [];
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      const converted = toTreeFolder(child);
      if (converted) {
        children.push(converted);
      }
    }
  }

  return {
    id: node.id,
    title: node.title,
    icon: extractFolderIcon(node.icon),
    parent_id: node.parent_id,
    children,
  };
}

/**
 * アイコン指定文字列をアイコンに変換
 *
 * @description Joplinから取れるicon情報はJson文字列の為、パースして変換
 *
 * @param icon JSON文字列で表現されたフォルダアイコン
 * @returns 抽出された絵文字、または解析に失敗した場合はundefined
 */
function extractFolderIcon(icon?: string): string | undefined {
  if (!icon) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(icon) as FolderIcon | string;
    if (typeof parsed === 'string') {
      return parsed;
    }
    if (parsed && typeof parsed === 'object' && typeof parsed.emoji === 'string') {
      return parsed.emoji;
    }
  } catch (error) {
    Logger.warn('Failed to parse folder icon JSON', { icon, error });
  }

  return undefined;
}
