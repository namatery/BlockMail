/**
 * High-level email operations: send (encrypt + upload + on-chain), load list, fetch by CID.
 */

import type { Contract } from 'ethers';
import { Email } from '../types';
import { bytes32ToPk, pkToBytes32 } from '../utils/helpers';
import { KeyRegistryService } from './keyRegistry';
import { ipfs } from './ipfs';
import sodium from 'libsodium-wrappers';

export class EmailService {
  constructor(
    private emailContract: Contract,
    private keyRegistry: KeyRegistryService,
  ) {}

  async send(address: string, params: SendEmailParams): Promise<Email> {
    const now = Date.now();
    
    const payload = JSON.stringify({
      subject: params.subject,
      body: params.body,
    });

    const recipientPk = await this.keyRegistry.getPubKey(params.destination);
    if (!recipientPk) {
      throw new Error('Recipient has not registered a public key');
    }

    const { ephemeralPub, encryptedData } = await this.encrypt(payload, recipientPk);

    const cid = await ipfs.upload({
      from: address,
      to: params.destination,
      pk: pkToBytes32(ephemeralPub),
      ciphertext: encryptedData,
      timestamp: now,
    });
    
    const tx = await this.emailContract.sendMessage(params.destination, cid);
    await tx.wait();

    return {
      id: cid,
      cid,
      from: address,
      to: params.destination,
      subject: '',
      body: 'Encrypted',
      timestamp: new Date(now),
      read: true,
      direction: 'sent',
    }
  }

  async load(address: string): Promise<Email[]> {
    const filterToMe = this.emailContract.filters.Message(null, address);
    const filterFromMe = this.emailContract.filters.Message(address, null);

    const [eventsTo, eventsFrom] = await Promise.all([
      this.emailContract.queryFilter(filterToMe),
      this.emailContract.queryFilter(filterFromMe),
    ]);

    const received = await Promise.all(
      eventsTo.map(async (ev) => {
        return this.getOne(address, { cid: ev.args.cid, direction: 'received' });
      })
    );

    const sent = await Promise.all(
      eventsFrom.map(async (ev) => {
        return this.getOne(address, { cid: ev.args.cid, direction: 'sent' });
      })
    );

    return [
      ...received, 
      ...sent
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }


  private async getOne(address: string, params: GetOneParams): Promise<Email> {
    const payload = await ipfs.get(params.cid);
    if (!payload) throw new Error('Email not found');

    if (params.direction == 'sent') {
      return {
        id: params.cid,
        cid: params.cid,
        from: payload.from,
        to: payload.to,
        subject: '',
        body: 'Encrypted',
        timestamp: new Date(payload.timestamp),
        read: false,
        direction: 'sent',
      }
    }

    const pk = await this.keyRegistry.getPubKey(address);
    const sk = await this.keyRegistry.getSecKey(address);
    if (!pk || !sk) throw new Error('Key not found');

    const plain = await this.decrypt(
      pk, 
      sk, 
      sodium.from_hex(payload.ciphertext), 
      bytes32ToPk(payload.pk)
    );

    const parsed = JSON.parse(plain) as {
      subject: string;
      body: string;
    };

    return {
      id: params.cid,
      cid: params.cid,
      from: payload.from,
      to: payload.to,
      subject: parsed.subject,
      body: parsed.body,
      timestamp: new Date(payload.timestamp),
      read: false,
      direction: payload.from === address ? 'sent' : 'received',
    };
  }

  private async encrypt(
    payload: string, 
    recipientPub: Uint8Array
  ): Promise<{ ephemeralPub: Uint8Array; encryptedData: string }> {
    await sodium.ready;

    const ephemeral = sodium.crypto_kx_keypair();

    const { sharedTx: sharedSecret } = sodium.crypto_kx_client_session_keys(
      ephemeral.publicKey,
      ephemeral.privateKey,
      recipientPub
    );

    const symKey = sharedSecret.slice(0, sodium.crypto_secretbox_KEYBYTES);
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

    const ciphertext = sodium.crypto_secretbox_easy(
      sodium.from_string(payload), 
      nonce, 
      symKey
    );

    const fullEncrypted = new Uint8Array(nonce.length + ciphertext.length);
    fullEncrypted.set(nonce, 0);
    fullEncrypted.set(ciphertext, nonce.length);

    sodium.memzero(ephemeral.privateKey);
    sodium.memzero(sharedSecret);
    sodium.memzero(symKey);
  
    return {
      ephemeralPub: ephemeral.publicKey,
      encryptedData: sodium.to_hex(fullEncrypted),
    };
  }

  private async decrypt(
    recipientPub: Uint8Array,
    recipientPrv: Uint8Array,
    encryptedData: Uint8Array,
    ephemeralPub: Uint8Array,
  ): Promise<string> {
    await sodium.ready;
  
    const { sharedRx: sharedSecret } = sodium.crypto_kx_server_session_keys(
      recipientPub,
      recipientPrv,
      ephemeralPub
    );
  
    const symKey = sharedSecret.slice(0, sodium.crypto_secretbox_KEYBYTES);
  
    const nonce = encryptedData.slice(0, sodium.crypto_secretbox_NONCEBYTES);
    const ciphertext = encryptedData.slice(sodium.crypto_secretbox_NONCEBYTES);
  
    const plaintextBytes = sodium.crypto_secretbox_open_easy(
      ciphertext,
      nonce,
      symKey
    );
  
    const plaintext = sodium.to_string(plaintextBytes);
  
    sodium.memzero(sharedSecret);
    sodium.memzero(symKey);
  
    return plaintext;
  }
}

export interface SendEmailParams {
  destination: string;
  subject: string;
  body: string;
}

export interface GetOneParams {
  cid: string;
  direction: 'sent' | 'received';
}
