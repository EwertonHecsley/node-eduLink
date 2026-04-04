import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUserUseCase } from '@/application/useCases/user/Create';
import { DeleteUserUseCase } from '@/application/useCases/user/Delete';
import { FindUserUseCase } from '@/application/useCases/user/Find';
import { ListAllUsersUseCase } from '@/application/useCases/user/List';
import { UpdateUserUseCase } from '@/application/useCases/user/Update';
import { UserPrismaRepository } from '@/infra/database/prisma/repository/user/UserPrismaRepository';
import { HashService } from '@/infra/services/hash/HashService';
import { UserPrismaMapper } from '@/infra/database/prisma/mappers/UserPrismaMapper';
import { User } from '@/core/domain/user/entity/User';
import { CreateUserDto, UpdateUserDto } from './dto/schemaUserDto';

export class UserController {
  private readonly createUserService: CreateUserUseCase;
  private readonly listUserService: ListAllUsersUseCase;
  private readonly findUserService: FindUserUseCase;
  private readonly updateUserService: UpdateUserUseCase;
  private readonly deleteUserService: DeleteUserUseCase;
  private readonly hashService: HashService;

  constructor(private readonly userRepository: UserPrismaRepository) {
    this.hashService = new HashService();
    this.createUserService = new CreateUserUseCase(
      this.userRepository,
      this.hashService,
    );
    this.listUserService = new ListAllUsersUseCase(this.userRepository);
    this.findUserService = new FindUserUseCase(this.userRepository);
    this.updateUserService = new UpdateUserUseCase(
      this.userRepository,
      this.hashService,
    );
    this.deleteUserService = new DeleteUserUseCase(this.userRepository);
  }

  private mapUserResponse(user: User) {
    const raw = UserPrismaMapper.toDatabase(user);
    const { password, ...safeUser } = raw;
    return safeUser;
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = request.body as CreateUserDto;

    const result = await this.createUserService.execute(body);

    if (result.isLeft()) {
      const { statusCode, message } = result.value;
      reply.status(statusCode).send({ message });
      return;
    }

    reply.status(201).send({
      message: 'Usuário criado com sucesso',
      user: this.mapUserResponse(result.value),
    });
  }

  async list(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await this.listUserService.execute();

      reply.status(200).send({
        message: 'Usuários listados com sucesso',
        users: result.map((user) => this.mapUserResponse(user)),
      });
    } catch (error) {
      console.error(error);
      reply.status(500).send({ message: 'Internal Error.' });
    }
  }

  async find(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    const result = await this.findUserService.execute({ id });

    if (result.isLeft()) {
      const { statusCode, message } = result.value;
      reply.status(statusCode).send({ message });
      return;
    }

    reply.status(200).send({
      message: 'Usuário encontrado com sucesso',
      user: this.mapUserResponse(result.value),
    });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as UpdateUserDto;

    const result = await this.updateUserService.execute({ id, ...body });

    if (result.isLeft()) {
      const { statusCode, message } = result.value;
      reply.status(statusCode).send({ message });
      return;
    }

    reply.status(204).send();
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    const result = await this.deleteUserService.execute({ id });

    if (result.isLeft()) {
      const { statusCode, message } = result.value;
      reply.status(statusCode).send({ message });
      return;
    }

    reply.status(204).send();
  }
}
