import { CreateUserFactory } from "@/application/useCases/user/factory/CreateUserFactory";
import { InvalidFullNameException } from "@/utils/errors/customs/InvalidNameException";
import { InvalidEmailException } from "@/utils/errors/customs/InvalidEmailException";
import { InvalidCnpjException } from "@/utils/errors/customs/InvalidCnpjException";
import { FullName } from "@/core/domain/objectValues/FullName";
import { CNPJ } from "@/core/domain/objectValues/CNPJ";
import { Email } from "@/core/domain/objectValues/Email";
import { left } from "@/utils/either";

describe("CreateUserFactory", () => {
  const validRequest = {
    fullName: "Valid Name",
    cnpj: "12345678000190",
    email: "valid@email.com",
    password: "password123",
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("validate", () => {
    it("should return right(true) if all data is valid", () => {
      const result = CreateUserFactory.validate(validRequest);
      expect(result.isRight()).toBe(true);
      expect(result.value).toBe(true);
    });

    it("should return left with InvalidFullNameException if fullName is invalid", () => {
      jest.spyOn(FullName, "create").mockReturnValueOnce(left(new InvalidFullNameException()));
      const result = CreateUserFactory.validate({ ...validRequest, fullName: "ab" });
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidFullNameException);
    });

    it("should return left with InvalidCnpjException if cnpj is invalid", () => {
      jest.spyOn(CNPJ, "create").mockReturnValueOnce(left(new InvalidCnpjException("Invalid CNPJ string.")));
      const result = CreateUserFactory.validate({ ...validRequest, cnpj: "invalid" });
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidCnpjException);
    });

    it("should return left with InvalidEmailException if email is invalid", () => {
      jest.spyOn(Email, "create").mockReturnValueOnce(left(new InvalidEmailException()));
      const result = CreateUserFactory.validate({ ...validRequest, email: "invalid" });
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidEmailException);
    });
  });

  describe("build", () => {
    it("should successfully build a User entity", () => {
      const result = CreateUserFactory.build(validRequest);
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.fullName.fullName).toBe("Valid Name");
      }
    });

    it("should return left with InvalidFullNameException if fullName is invalid during build", () => {
      jest.spyOn(FullName, "create").mockReturnValueOnce(left(new InvalidFullNameException()));
      const result = CreateUserFactory.build({ ...validRequest, fullName: "ab" });
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidFullNameException);
    });

    it("should return left with InvalidCnpjException if cnpj is invalid during build", () => {
      jest.spyOn(CNPJ, "create").mockReturnValueOnce(left(new InvalidCnpjException("Invalid CNPJ string.")));
      const result = CreateUserFactory.build({ ...validRequest, cnpj: "invalid" });
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidCnpjException);
    });

    it("should return left with InvalidEmailException if email is invalid during build", () => {
      jest.spyOn(Email, "create").mockReturnValueOnce(left(new InvalidEmailException()));
      const result = CreateUserFactory.build({ ...validRequest, email: "invalid" });
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidEmailException);
    });
  });
});
