import { HashGateway } from '@/core/domain/user/ports/HashGateway';
import { UserGateway } from '@/core/domain/user/ports/UserGateway';
import { Either, left, right } from '@/utils/either';
import { InvalidCnpjException } from '@/utils/errors/customs/InvalidCnpjException';
import { InvalidEmailException } from '@/utils/errors/customs/InvalidEmailException';
import { InvalidFullNameException } from '@/utils/errors/customs/InvalidNameException';
import { BadRequestException } from '@/utils/errors/customs/BadRequestException';
import { NotFoundException } from '@/utils/errors/customs/NotFoundException';
import {
  UpdateUserFactory,
  UpdateUserRequest,
} from './factory/UpdateUserFactory';

type UpdateUserUseCaseRequest = UpdateUserRequest & { id: string };

export class UpdateUserUseCase {
  constructor(
    private readonly userGateway: UserGateway,
    private readonly hashGateway: HashGateway,
  ) {}

  async execute(
    data: UpdateUserUseCaseRequest,
  ): Promise<
    Either<
      | InvalidFullNameException
      | InvalidCnpjException
      | InvalidEmailException
      | BadRequestException
      | NotFoundException,
      void
    >
  > {
    const { id, ...updateData } = data;

    const validationOrError = UpdateUserFactory.validate(updateData);
    if (validationOrError.isLeft()) {
      return left(validationOrError.value);
    }

    const user = await this.userGateway.findById(id);
    if (!user) {
      return left(new NotFoundException('Usuário não encontrado.'));
    }

    if (updateData.cnpj && updateData.cnpj !== user.cnpj.getNumeric()) {
      const cnpjExists = await this.userGateway.findByCnpj(updateData.cnpj);
      if (cnpjExists)
        return left(new BadRequestException('CNPJ já cadastrado'));
    }

    if (updateData.email && updateData.email !== user.email.email) {
      const emailExists = await this.userGateway.findByEmail(updateData.email);
      if (emailExists)
        return left(new BadRequestException('Email já cadastrado'));
    }

    if (updateData.fullName) {
      user.changeName(updateData.fullName);
    }

    if (updateData.cnpj) {
      user.changeCnpj(updateData.cnpj);
    }

    if (updateData.email) {
      user.changeEmail(updateData.email);
    }

    if (updateData.password) {
      const hashedPassword = await this.hashGateway.hash(updateData.password);
      user.changePassword(hashedPassword);
    }

    await this.userGateway.update(user);
    return right(undefined);
  }
}
