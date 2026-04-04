import { CNPJ } from '@/core/domain/objectValues/CNPJ';
import { Email } from '@/core/domain/objectValues/Email';
import { FullName } from '@/core/domain/objectValues/FullName';
import { User } from '@/core/domain/user/entity/User';
import Identity from '@/core/generics/Identity';
import { User as UserDatabase } from '../../../../generated/prisma/client';

export class UserPrismaMapper {
  static toDatabase(entity: User): UserDatabase {
    return {
      id: entity.id.valueId,
      fullName: entity.fullName.fullName,
      cnpj: entity.cnpj.getFormatted(),
      email: entity.email.email,
      password: entity.password,
      role: entity.role,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toDomain(database: UserDatabase): User {
    const fullNameOrError = FullName.create(database.fullName);
    const cnpjOrError = CNPJ.create(database.cnpj);
    const emailOrError = Email.create(database.email);

    if (
      fullNameOrError.isLeft() ||
      cnpjOrError.isLeft() ||
      emailOrError.isLeft()
    ) {
      throw new Error('Error creating user');
    }

    return User.create(
      {
        fullName: fullNameOrError.value,
        cnpj: cnpjOrError.value,
        email: emailOrError.value,
        password: database.password,
        role: database.role,
        createdAt: database.createdAt,
        updatedAt: database.updatedAt,
      },
      new Identity(database.id),
    );
  }
}
