import { UserGateway } from '@/core/domain/user/ports/UserGateway';
import { prisma } from '../../connection';
import { User } from '@/core/domain/user/entity/User';
import { UserPrismaMapper } from '../../mappers/UserPrismaMapper';

export class UserPrismaRepository implements UserGateway {
  private readonly prisma = prisma;

  async create(user: User): Promise<User> {
    const data = UserPrismaMapper.toDatabase(user);
    const userCreated = await this.prisma.user.create({ data });
    return UserPrismaMapper.toDomain(userCreated);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map(UserPrismaMapper.toDomain);
  }

  async findByCnpj(cnpj: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { cnpj } });
    return user ? UserPrismaMapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? UserPrismaMapper.toDomain(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? UserPrismaMapper.toDomain(user) : null;
  }

  async update(user: User): Promise<void> {
    const data = UserPrismaMapper.toDatabase(user);
    await this.prisma.user.update({
      where: { id: user.id.valueId },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
