
export const RequestMessageType = {
  GetFolders: "getFolders",
  SelectFolder: "selectFolder"
} as const

export type RequestMessageType = (typeof RequestMessageType)[keyof typeof RequestMessageType];


export const NotifyMessageType = {
  UpdateFolderList: "updateFolderList"
} as const

export type NotifyMessageType = (typeof NotifyMessageType)[keyof typeof NotifyMessageType];
