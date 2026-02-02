import { ethers } from 'ethers';
import { storage } from './storage';
import type { Contract } from 'ethers';
import sodium from 'libsodium-wrappers';
import { bytes32ToPk, pkToBytes32 } from '../utils/helpers';

interface KeyPair {
  pk: Uint8Array;
  sk: Uint8Array;
}

export const ZERO_BYTES32 = '0x' + '0'.repeat(64);

export class KeyRegistryService {
  constructor(
    private keyRegistryContract: Contract, 
  ) {}

  /**
   * Ensure this address has a keypair and its public key is on chain.
   * - If no keypair in storage: generate one, call setPubKey, then save.
   * - If keypair in storage but contract has no key (e.g. after redeploy): call setPubKey again.
   */
  async init(address: string) {
    let sk: Uint8Array;
    let pk: Uint8Array;

    const existingSk = await this.getSecKey(address);
    if (!existingSk) {
      sk = sodium.randombytes_buf(sodium.crypto_box_SECRETKEYBYTES);
      pk = sodium.crypto_scalarmult_base(sk);
      storage.set(
        'keypair',
        address,
        JSON.stringify({ pk: Array.from(pk), sk: Array.from(sk) })
      );
    } else {
      const raw = storage.get('keypair', address);
      if (!raw) {
        sk = sodium.randombytes_buf(sodium.crypto_box_SECRETKEYBYTES);
        pk = sodium.crypto_scalarmult_base(sk);
        storage.set('keypair', address, JSON.stringify({ pk: Array.from(pk), sk: Array.from(sk) }));
      } else {
        const parsed = JSON.parse(raw) as KeyPair;
        sk = new Uint8Array(parsed.sk);
        pk = new Uint8Array(parsed.pk);
      }
    }

    const pkHex = this.formatBytes32(pk);
    let currentHex: string;
    try {
      currentHex = await this.keyRegistryContract.pk(address);
    } catch {
      currentHex = ZERO_BYTES32;
    }
    if (!currentHex || currentHex === ZERO_BYTES32 || currentHex.toLowerCase() !== pkHex.toLowerCase()) {
      const tx = await this.keyRegistryContract.setPubKey(pkHex);
      await tx.wait();
      console.log('KeyRegistryService: public key set on contract');
    }
  }

  async getSecKey(address: string): Promise<Uint8Array | null> {
    const raw = storage.get('keypair', address);
    if (!raw) return null;
    const { sk } = JSON.parse(raw) as KeyPair;
    return new Uint8Array(sk);
  }

  async getPubKey(address: string): Promise<Uint8Array | null> {
    let pkHex: string;
    try {
      pkHex = await this.keyRegistryContract.pk(address);
    } catch (error: unknown) {
      // BAD_DATA / value="0x" = no contract at address or wrong contract (e.g. KeyRegistry not deployed)
      const msg = error instanceof Error ? error.message : String(error);
      const isBadData =
        msg.includes('could not decode') ||
        msg.includes('BAD_DATA') ||
        (error && typeof error === 'object' && (error as { code?: string }).code === 'BAD_DATA');
      if (isBadData) {
        console.warn(
          'KeyRegistryService: no contract or empty result at configured address. Is KeyRegistry deployed? Check VITE_KEY_REGISTRY_ADDRESS.'
        );
      } else {
        console.warn('KeyRegistryService: getPubKey failed for', address, msg);
      }
      return null;
    }
    if (!pkHex || pkHex === ZERO_BYTES32) return null;
    return bytes32ToPk(pkHex);
  }

  private formatBytes32(key: Uint8Array): string {
    const hex = pkToBytes32(key).toLowerCase();
    return ethers.zeroPadValue('0x' + hex, 32);
  }
}
