/**
 * IPFS / Pinata: upload encrypted payloads and fetch by CID.
 */

import { PinataSDK } from 'pinata';
import { PINATA_JWT, PINATA_GATEWAY } from '../config/constants';

interface Payload {
  from: string;
  to: string;
  pk: string;
  ciphertext: string;
  timestamp: number;
}

class IpfsService {
  private client: PinataSDK;

  constructor(
    private pinataJwt: string,
    private pinataGateway: string,
  ) {
    this.client = new PinataSDK({
      pinataJwt: this.pinataJwt,
      pinataGateway: this.pinataGateway,
    });
  }

  async upload(payload: Payload): Promise<string> {
    const result = await this.client.upload.public.json(payload);
    return result.cid;
  }

  async get(cid: string): Promise<Payload | null> {
    const { data } = await this.client.gateways.public.get(cid);
    return data as Payload | null;
  }
}

export const ipfs = new IpfsService(PINATA_JWT, PINATA_GATEWAY);