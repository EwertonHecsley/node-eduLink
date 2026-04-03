import { User } from '@/core/domain/user/entity/User';
import { HashGateway } from '@/core/domain/user/ports/HashGateway';
import { UserGateway } from '@/core/domain/user/ports/UserGateway';
import { Either, left, right } from '@/utils/either';
import { InvalidCnpjException } from '@/utils/errors/customs/InvalidCnpjException';
import { InvalidEmailException } from '@/utils/errors/customs/InvalidEmailException';
import { InvalidFullNameException } from '@/utils/errors/customs/InvalidNameException';
import { CreateUserFactory, UserRequest } from './factory/CreateUserFactory';
import { BadRequestException } from '@/utils/errors/customs/BadRequestException';

export class CreateUserUseCase {
  constructor(
    private readonly userGateway: UserGateway,
    private readonly hashGateway: HashGateway,
  ) {}

  async execute(
    data: UserRequest,
  ): Promise<
    Either<
      | InvalidFullNameException
      | InvalidCnpjException
      | InvalidEmailException
      | BadRequestException,
      User
    >
  > {
    const { fullName, cnpj, email, password } = data;

    const validationOrError = CreateUserFactory.validate({
      fullName,
      cnpj,
      email,
    });
    if (validationOrError.isLeft()) {
      return left(validationOrError.value);
    }

    const [cnpjExists, emailExists] = await Promise.all([
      this.userGateway.findByCnpj(cnpj),
      this.userGateway.findByEmail(email),
    ]);

    if (cnpjExists) return left(new BadRequestException('CNPJ já cadastrado'));
    if (emailExists)
      return left(new BadRequestException('Email já cadastrado'));

    const hashedPassword = await this.hashGateway.hash(password);

    const userOrError = CreateUserFactory.build({
      fullName,
      cnpj,
      email,
      password: hashedPassword,
    });
    if (userOrError.isLeft()) return left(userOrError.value);

    const userCreated = await this.userGateway.create(userOrError.value);
    return right(userCreated);
  }
}
