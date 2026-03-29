
export const RequestMessageType = {
  GetFolders: "getFolders",
  SelectFolder: "selectFolder"
} as const

export type RequestMessageType = (typeof RequestMessageType)[keyof typeof RequestMessageType];


export const NotifyMessageType = {
  UpdateFolderList: "updateFolderList"
} as const

export type NotifyMessageType = (typeof NotifyMessageType)[keyof typeof NotifyMessageType];

// Tree-structured folder data for webview rendering.
export interface TreeFolder {
  id: string;
  title: string;
  icon?: string;
  parent_id?: string;
  children: TreeFolder[];
}



export type FlatFolder = { id: string; title: string; depth: number; icon?: string };
