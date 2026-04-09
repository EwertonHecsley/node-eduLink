import { HashGateway } from '@/core/domain/user/ports/HashGateway';
import * as argon2 from 'argon2';

export class HashService implements HashGateway {
  async hash(password: string): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1,
    });
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await argon2.verify(hash, password);
  }
}
