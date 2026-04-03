import Entity from '@/core/generics/Entity';
import { Email } from '../../objectValues/Email';
import { FullName } from '../../objectValues/FullName';
import { CNPJ } from '../../objectValues/CNPJ';
import type Identity from '@/core/generics/Identity';

export type UserProps = {
  fullName: FullName;
  cnpj: CNPJ;
  email: Email;
  password: string;
  role: string;
  createdAt: Date;
};

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: Identity) {
    super(props, id);
  }

  static create(props: UserProps, id?: Identity) {
    return new User(
      {
        ...props,
        role: props.role || 'ADM',
        createdAt: props.createdAt || new Date(),
      },
      id,
    );
  }

  get fullName(): FullName {
    return this.props.fullName;
  }

  get cnpj(): CNPJ {
    return this.props.cnpj;
  }

  get email(): Email {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get role(): string {
    return this.props.role;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  changeName(newName: string): void {
    const result = FullName.create(newName);
    if (result.isLeft()) {
      throw result.value;
    }
    this.props.fullName = result.value;
  }

  changeEmail(newEmail: string): void {
    const result = Email.create(newEmail);
    if (result.isLeft()) {
      throw result.value;
    }
    this.props.email = result.value;
  }

  changeCnpj(newCnpj: string): void {
    const result = CNPJ.create(newCnpj);
    if (result.isLeft()) {
      throw result.value;
    }
    this.props.cnpj = result.value;
  }

  changePassword(newPassword: string): void {
    this.props.password = newPassword;
  }

  changeRole(newRole: string): void {
    this.props.role = newRole;
  }
}
