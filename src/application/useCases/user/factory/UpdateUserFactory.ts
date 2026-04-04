import { CNPJ } from '@/core/domain/objectValues/CNPJ';
import { Email } from '@/core/domain/objectValues/Email';
import { FullName } from '@/core/domain/objectValues/FullName';
import { Either, left, right } from '@/utils/either';
import { InvalidCnpjException } from '@/utils/errors/customs/InvalidCnpjException';
import { InvalidEmailException } from '@/utils/errors/customs/InvalidEmailException';
import { InvalidFullNameException } from '@/utils/errors/customs/InvalidNameException';

export type UpdateUserRequest = Partial<{
  fullName: string;
  cnpj: string;
  email: string;
  password: string;
}>;

type ValidationError =
  | InvalidFullNameException
  | InvalidCnpjException
  | InvalidEmailException;

export class UpdateUserFactory {
  static validate(data: UpdateUserRequest): Either<ValidationError, true> {
    if (data.fullName !== undefined) {
      const fullNameOrError = FullName.create(data.fullName);
      if (fullNameOrError.isLeft()) {
        return left(fullNameOrError.value);
      }
    }

    if (data.cnpj !== undefined) {
      const cnpjOrError = CNPJ.create(data.cnpj);
      if (cnpjOrError.isLeft()) {
        return left(cnpjOrError.value);
      }
    }

    if (data.email !== undefined) {
      const emailOrError = Email.create(data.email);
      if (emailOrError.isLeft()) {
        return left(emailOrError.value);
      }
    }

    return right(true);
  }
}
