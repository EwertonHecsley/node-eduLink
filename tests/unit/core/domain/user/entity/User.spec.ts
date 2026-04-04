import { User, type UserProps } from '@/core/domain/user/entity/User';
import { FullName } from '@/core/domain/objectValues/FullName';
import { Email } from '@/core/domain/objectValues/Email';
import { CNPJ } from '@/core/domain/objectValues/CNPJ';
import { InvalidFullNameException } from '@/utils/errors/customs/InvalidNameException';
import { InvalidEmailException } from '@/utils/errors/customs/InvalidEmailException';
import { InvalidCnpjException } from '@/utils/errors/customs/InvalidCnpjException';

describe('User Entity', () => {
  let validFullName: FullName;
  let validEmail: Email;
  let validCnpj: CNPJ;

  beforeAll(() => {
    validFullName = FullName.create('Admin User').value as FullName;
    validEmail = Email.create('admin@school.com').value as Email;
    validCnpj = CNPJ.create('12345678000190').value as CNPJ;
  });

  it('should create a User entity with all provided props', () => {
    const createdAt = new Date('2023-01-01T00:00:00.000Z');
    const userProps: UserProps = {
      fullName: validFullName,
      email: validEmail,
      cnpj: validCnpj,
      password: 'hashedPassword123',
      role: 'DIRECTOR',
      createdAt: createdAt,
      updatedAt: createdAt,
    };

    const user = User.create(userProps);

    expect(user).toBeInstanceOf(User);
    expect(user.fullName.fullName).toBe('Admin User');
    expect(user.email.email).toBe('admin@school.com');
    expect(user.cnpj.getNumeric()).toBe('12345678000190');
    expect(user.password).toBe('hashedPassword123');
    expect(user.role).toBe('DIRECTOR');
    expect(user.createdAt).toEqual(createdAt);
  });

  it('should create a User entity with default role and creation date if missing', () => {
    const userProps: any = {
      fullName: validFullName,
      email: validEmail,
      cnpj: validCnpj,
      password: 'hashedPassword123',
    };

    const user = User.create(userProps as UserProps);

    expect(user).toBeInstanceOf(User);
    expect(user.role).toBe('ADM');
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  describe('State changes', () => {
    let user: User;

    beforeEach(() => {
      const userProps: UserProps = {
        fullName: validFullName,
        email: validEmail,
        cnpj: validCnpj,
        password: 'hashedPassword123',
        role: 'ADM',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      user = User.create(userProps);
    });

    it('should successfully change the full name when a valid name is provided', () => {
      user.changeName('New Admin Name');
      expect(user.fullName.fullName).toBe('New Admin Name');
    });

    it('should throw an exception when trying to change to an invalid full name', () => {
      expect(() => {
        user.changeName('a'); // Invalid length
      }).toThrow(InvalidFullNameException);
    });

    it('should successfully change the email when a valid email is provided', () => {
      user.changeEmail('newadmin@school.com');
      expect(user.email.email).toBe('newadmin@school.com');
    });

    it('should throw an exception when trying to change to an invalid email', () => {
      expect(() => {
        user.changeEmail('invalid-email');
      }).toThrow(InvalidEmailException);
    });

    it('should successfully change the CNPJ when a valid CNPJ is provided', () => {
      user.changeCnpj('98765432000198'); // A 14 digit string
      expect(user.cnpj.getNumeric()).toBe('98765432000198');
    });

    it('should throw an exception when trying to change to an invalid CNPJ (repeated seq)', () => {
      expect(() => {
        user.changeCnpj('11111111111111'); // Invalid sequence
      }).toThrow(InvalidCnpjException);
    });

    it('should throw an exception when trying to change to a CNPJ of invalid length', () => {
      expect(() => {
        user.changeCnpj('123'); // Invalid length
      }).toThrow(InvalidCnpjException);
    });

    it('should change the password', () => {
      user.changePassword('newHashedPassword456');
      expect(user.password).toBe('newHashedPassword456');
    });

    it('should change the role', () => {
      user.changeRole('INSTRUCTOR');
      expect(user.role).toBe('INSTRUCTOR');
    });
  });
});
