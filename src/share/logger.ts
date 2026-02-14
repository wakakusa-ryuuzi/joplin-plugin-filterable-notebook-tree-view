/**
 * Logger utility for plugin logging
 */
export class Logger {
  private static prefix = 'FilterableFolderTreeView';

  static debug(message: string, ...args: any[]): void {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}][${this.prefix}] DEBUG: ${message}`, ...args);
  }
  static info(message: string, ...args: any[]): void {
    const timestamp = new Date().toLocaleTimeString();
    console.info(`[${timestamp}][${this.prefix}] INFO: ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    const timestamp = new Date().toLocaleTimeString();
    console.warn(`[${timestamp}][${this.prefix}] WARN: ${message}`, ...args);
  }

  static error(message: string, ...args: any[]): void {
    const timestamp = new Date().toLocaleTimeString();
    console.error(`[${timestamp}][${this.prefix}] ERROR: ${message}`, ...args);
  }
}
