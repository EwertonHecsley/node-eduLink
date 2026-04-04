import { HashService } from '@/infra/services/hash/HashService';
import * as argon2 from 'argon2';

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  verify: jest.fn().mockImplementation(async (hash, pass) => {
    if (hash === 'bad_hash') {
      throw new Error('Verification failed inside argon2');
    }
    return hash === 'hashed_password' && pass === 'password';
  }),
  argon2id: 2,
}));

describe('HashService', () => {
  let service: HashService;

  beforeEach(() => {
    service = new HashService();
  });

  describe('hash', () => {
    it('should cleanly hash the provided string', async () => {
      const res = await service.hash('password');
      expect(res).toBe('hashed_password');
      expect(argon2.hash).toHaveBeenCalledWith('password', expect.any(Object));
    });
  });

  describe('compare', () => {
    it('should return true if hashes match', async () => {
      const res = await service.compare('password', 'hashed_password');
      expect(res).toBe(true);
    });

    it('should return false if hashes do not match', async () => {
      const res = await service.compare('wrong', 'hashed_password');
      expect(res).toBe(false);
    });

    it('should handle argon2 exceptions gracefully and return false', async () => {
      const res = await service.compare('password', 'bad_hash');
      expect(res).toBe(false);
    });
  });
});
