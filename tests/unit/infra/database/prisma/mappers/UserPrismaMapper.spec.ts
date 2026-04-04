import { UserPrismaMapper } from '@/infra/database/prisma/mappers/UserPrismaMapper';

describe('UserPrismaMapper', () => {
  it('should throw Error if domain validation fails', () => {
    const rawDbUser = {
      id: 'uuid-1',
      fullName: 'ab', // Invalid length
      cnpj: 'invalid-cnpj',
      email: 'invalid-email',
      password: 'hash',
      role: 'ADM',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(() => UserPrismaMapper.toDomain(rawDbUser as any)).toThrow('Error creating user');
  });

  it('should successfully map toDomain when data is valid', () => {
    const rawDbUser = {
      id: 'uuid-1',
      fullName: 'Valid Name',
      cnpj: '12345678000190',
      email: 'valid@example.com',
      password: 'hash',
      role: 'ADM',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const user = UserPrismaMapper.toDomain(rawDbUser as any);
    expect(user.id.valueId).toBe('uuid-1');
    expect(user.fullName.fullName).toBe('Valid Name');
    expect(user.cnpj.getNumeric()).toBe('12345678000190');
    expect(user.email.email).toBe('valid@example.com');
  });
});
