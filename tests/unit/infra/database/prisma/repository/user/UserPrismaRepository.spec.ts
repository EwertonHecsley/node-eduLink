import { UserPrismaRepository } from '@/infra/database/prisma/repository/user/UserPrismaRepository';
import { prisma } from '@/infra/database/prisma/connection';
import { UserPrismaMapper } from '@/infra/database/prisma/mappers/UserPrismaMapper';
import { User } from '@/core/domain/user/entity/User';

jest.mock('@/infra/database/prisma/connection', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@/infra/database/prisma/mappers/UserPrismaMapper', () => ({
  UserPrismaMapper: {
    toDatabase: jest.fn(),
    toDomain: jest.fn(),
  },
}));

describe('UserPrismaRepository', () => {
  let repository: UserPrismaRepository;

  beforeEach(() => {
    repository = new UserPrismaRepository();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user and map results', async () => {
      const mockDomainUser = {} as User;
      const mockDbUser = { id: 'db-id' };
      
      (UserPrismaMapper.toDatabase as jest.Mock).mockReturnValue(mockDbUser);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockDbUser);
      (UserPrismaMapper.toDomain as jest.Mock).mockReturnValue(mockDomainUser);

      const result = await repository.create(mockDomainUser);
      
      expect(UserPrismaMapper.toDatabase).toHaveBeenCalledWith(mockDomainUser);
      expect(prisma.user.create).toHaveBeenCalledWith({ data: mockDbUser });
      expect(UserPrismaMapper.toDomain).toHaveBeenCalledWith(mockDbUser);
      expect(result).toBe(mockDomainUser);
    });
  });

  describe('findAll', () => {
    it('should return all mapped users', async () => {
      const mockDbUsers = [{ id: '1' }];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockDbUsers);
      (UserPrismaMapper.toDomain as jest.Mock).mockReturnValue({} as User);

      const result = await repository.findAll();
      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('findByCnpj', () => {
    it('should find user by CNPJ', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
      (UserPrismaMapper.toDomain as jest.Mock).mockReturnValue({} as User);

      const res = await repository.findByCnpj('11');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { cnpj: '11' } });
      expect(res).toBeDefined();
    });

    it('should return null if user by CNPJ not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const res = await repository.findByCnpj('11');
      expect(res).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by Email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
      (UserPrismaMapper.toDomain as jest.Mock).mockReturnValue({} as User);

      const res = await repository.findByEmail('a@b.com');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
      expect(res).toBeDefined();
    });

    it('should return null if user by Email not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const res = await repository.findByEmail('a@b.com');
      expect(res).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by Id', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
      (UserPrismaMapper.toDomain as jest.Mock).mockReturnValue({} as User);

      const res = await repository.findById('1');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(res).toBeDefined();
    });

    it('should return null if user by Id not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const res = await repository.findById('1');
      expect(res).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user correctly', async () => {
      const mockDomainUser = { id: { valueId: 'u-1' } } as unknown as User;
      const mockDbUser = { id: 'u-1' };
      (UserPrismaMapper.toDatabase as jest.Mock).mockReturnValue(mockDbUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockDbUser);

      await repository.update(mockDomainUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        data: mockDbUser,
      });
    });
  });

  describe('delete', () => {
    it('should delete user properly', async () => {
      (prisma.user.delete as jest.Mock).mockResolvedValue({});
      await repository.delete('1');
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
