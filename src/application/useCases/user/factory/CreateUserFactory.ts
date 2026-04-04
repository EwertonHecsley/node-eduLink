import { CNPJ } from '@/core/domain/objectValues/CNPJ';
import { Email } from '@/core/domain/objectValues/Email';
import { FullName } from '@/core/domain/objectValues/FullName';
import { User } from '@/core/domain/user/entity/User';
import { Either, left, right } from '@/utils/either';
import { InvalidCnpjException } from '@/utils/errors/customs/InvalidCnpjException';
import { InvalidEmailException } from '@/utils/errors/customs/InvalidEmailException';
import { InvalidFullNameException } from '@/utils/errors/customs/InvalidNameException';

export type UserValidationRequest = Omit<UserRequest, 'password'>;

export type UserRequest = {
  fullName: string;
  cnpj: string;
  email: string;
  password: string;
};

type ValidationError =
  | InvalidFullNameException
  | InvalidCnpjException
  | InvalidEmailException;

export class CreateUserFactory {
  static validate(data: UserValidationRequest): Either<ValidationError, true> {
    const fullNameOrError = FullName.create(data.fullName);
    if (fullNameOrError.isLeft()) {
      return left(fullNameOrError.value);
    }

    const cnpjOrError = CNPJ.create(data.cnpj);
    if (cnpjOrError.isLeft()) {
      return left(cnpjOrError.value);
    }

    const emailOrError = Email.create(data.email);
    if (emailOrError.isLeft()) {
      return left(emailOrError.value);
    }

    return right(true);
  }

  static build(data: UserRequest): Either<ValidationError, User> {
    const { fullName, cnpj, email, password } = data;

    const fullNameOrError = FullName.create(fullName);
    if (fullNameOrError.isLeft()) return left(fullNameOrError.value);

    const cnpjOrError = CNPJ.create(cnpj);
    if (cnpjOrError.isLeft()) return left(cnpjOrError.value);

    const emailOrError = Email.create(email);
    if (emailOrError.isLeft()) return left(emailOrError.value);

    const user = User.create({
      fullName: fullNameOrError.value,
      cnpj: cnpjOrError.value,
      email: emailOrError.value,
      password,
      role: 'ADM',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return right(user);
  }
}
