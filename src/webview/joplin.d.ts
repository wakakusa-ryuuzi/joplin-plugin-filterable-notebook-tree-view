import { WebviewApi } from '../../api/types';

declare global {
  interface Window {
    webviewApi: WebviewApi;
  }
}

export {};
