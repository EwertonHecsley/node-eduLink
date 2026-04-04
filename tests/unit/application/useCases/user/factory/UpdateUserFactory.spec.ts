import { UpdateUserFactory } from '@/application/useCases/user/factory/UpdateUserFactory';
import { InvalidFullNameException } from '@/utils/errors/customs/InvalidNameException';
import { InvalidEmailException } from '@/utils/errors/customs/InvalidEmailException';
import { InvalidCnpjException } from '@/utils/errors/customs/InvalidCnpjException';
import { FullName } from '@/core/domain/objectValues/FullName';
import { CNPJ } from '@/core/domain/objectValues/CNPJ';
import { Email } from '@/core/domain/objectValues/Email';
import { left } from '@/utils/either';

describe('UpdateUserFactory', () => {
  const validRequest = {
    fullName: 'Valid Name',
    cnpj: '12345678000190',
    email: 'valid@email.com',
    password: 'password123',
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('validate', () => {
    it('should return right(true) if all data is valid', () => {
      const result = UpdateUserFactory.validate(validRequest);
      expect(result.isRight()).toBe(true);
      expect(result.value).toBe(true);
    });

    it('should return right(true) if only some fields are provided', () => {
      const partialRequest = { email: 'valid@email.com' };
      const result = UpdateUserFactory.validate(partialRequest);
      expect(result.isRight()).toBe(true);
      expect(result.value).toBe(true);
    });

    it('should return right(true) if no fields are provided', () => {
      const emptyRequest = {};
      const result = UpdateUserFactory.validate(emptyRequest);
      expect(result.isRight()).toBe(true);
      expect(result.value).toBe(true);
    });

    it('should return left with InvalidFullNameException if fullName is invalid', () => {
      jest
        .spyOn(FullName, 'create')
        .mockReturnValueOnce(left(new InvalidFullNameException()));
      const result = UpdateUserFactory.validate({
        ...validRequest,
        fullName: 'ab',
      });
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidFullNameException);
    });

    it('should return left with InvalidCnpjException if cnpj is invalid', () => {
      jest
        .spyOn(CNPJ, 'create')
        .mockReturnValueOnce(
          left(new InvalidCnpjException('Invalid CNPJ string.')),
        );
      const result = UpdateUserFactory.validate({
        ...validRequest,
        cnpj: 'invalid',
      });
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidCnpjException);
    });

    it('should return left with InvalidEmailException if email is invalid', () => {
      jest
        .spyOn(Email, 'create')
        .mockReturnValueOnce(left(new InvalidEmailException()));
      const result = UpdateUserFactory.validate({
        ...validRequest,
        email: 'invalid',
      });
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidEmailException);
    });
  });
});
