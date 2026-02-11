/**
 * Logger utility for plugin logging
 */
export class Logger {
  private static prefix = '[MY Joplin test Plugin]';

  static info(message: string, ...args: any[]): void {
    console.info(`${this.prefix} INFO: ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(`${this.prefix} WARN: ${message}`, ...args);
  }

  static error(message: string, ...args: any[]): void {
    console.error(`${this.prefix} ERROR: ${message}`, ...args);
  }

  static debug(message: string, ...args: any[]): void {
    console.log(`${this.prefix} DEBUG: ${message}`, ...args);
  }
}
