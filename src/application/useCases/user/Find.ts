import { User } from '@/core/domain/user/entity/User';
import { UserGateway } from '@/core/domain/user/ports/UserGateway';
import { Either, left, right } from '@/utils/either';
import { BadRequestException } from '@/utils/errors/customs/BadRequestException';
import { NotFoundException } from '@/utils/errors/customs/NotFoundException';

type UserRequest = {
  id: string;
};

export class FindUserUseCase {
  constructor(private readonly userGateway: UserGateway) {}

  async execute({
    id,
  }: UserRequest): Promise<
    Either<NotFoundException | BadRequestException, User>
  > {
    if (!id || typeof id !== 'string')
      return left(new BadRequestException('ID Invalido.'));

    if (id.length !== 36) return left(new BadRequestException('ID Invalido.'));

    const user = await this.userGateway.findById(id);

    if (!user) return left(new NotFoundException('Usuario nao encontrado.'));

    return right(user);
  }
}
