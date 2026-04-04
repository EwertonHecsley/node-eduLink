import { UserGateway } from '@/core/domain/user/ports/UserGateway';
import { Either, left, right } from '@/utils/either';
import { BadRequestException } from '@/utils/errors/customs/BadRequestException';
import { NotFoundException } from '@/utils/errors/customs/NotFoundException';

type UserRequest = {
  id: string;
};

export class DeleteUserUseCase {
  constructor(private readonly userGateway: UserGateway) {}

  async execute({
    id,
  }: UserRequest): Promise<
    Either<NotFoundException | BadRequestException, void>
  > {
    if (!id || typeof id !== 'string')
      return left(new BadRequestException('ID Invalido.'));

    const user = await this.userGateway.findById(id);

    if (!user) return left(new NotFoundException('Usuario nao encontrado.'));

    await this.userGateway.delete(id);

    return right(undefined);
  }
}
