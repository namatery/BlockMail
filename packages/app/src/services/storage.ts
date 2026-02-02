/**
 * Global localStorage wrapper with a namespace prefix.
 * Use storage.get(namespace, key) / storage.set(namespace, key, value).
 */

const PREFIX = 'blockmail_';

type Namespace = 'keypair' | 'cached_wallets' | 'disconnected';

export class StorageService {
  get(namespace: Namespace, key: string): string | null {
    return localStorage.getItem(this.k(namespace, key));
  }

  set(namespace: Namespace, key: string, value: string): void {
    localStorage.setItem(this.k(namespace, key), value);
  }

  del(namespace: Namespace, key: string): void {
    localStorage.removeItem(this.k(namespace, key));
  }

  private k(namespace: Namespace, key: string): string {
    return `${PREFIX}${namespace}:${key}`;
  }
}

export const storage = new StorageService();