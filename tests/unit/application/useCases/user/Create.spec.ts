import { CreateUserUseCase } from "@/application/useCases/user/Create";
import { left } from "@/utils/either";
import { CreateUserFactory } from "@/application/useCases/user/factory/CreateUserFactory";
import { UserGateway } from "@/core/domain/user/ports/UserGateway";
import { HashGateway } from "@/core/domain/user/ports/HashGateway";
import { InvalidFullNameException } from "@/utils/errors/customs/InvalidNameException";
import { InvalidEmailException } from "@/utils/errors/customs/InvalidEmailException";
import { InvalidCnpjException } from "@/utils/errors/customs/InvalidCnpjException";
import { BadRequestException } from "@/utils/errors/customs/BadRequestException";
import { User } from "@/core/domain/user/entity/User";

describe("CreateUserUseCase", () => {
    let userGatewayMock: jest.Mocked<UserGateway>;
    let hashGatewayMock: jest.Mocked<HashGateway>;
    let useCase: CreateUserUseCase;

    const validUserRequest = {
        fullName: "Admin User",
        cnpj: "12345678000190",
        email: "admin@school.com",
        password: "password123",
    };

    beforeEach(() => {
        userGatewayMock = {
            findByCnpj: jest.fn().mockResolvedValue(null),
            findByEmail: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockImplementation(async (user: User) => user),
        } as unknown as jest.Mocked<UserGateway>;

        hashGatewayMock = {
            hash: jest.fn().mockResolvedValue("hashedPassword123"),
            compare: jest.fn(),
        } as unknown as jest.Mocked<HashGateway>;

        useCase = new CreateUserUseCase(userGatewayMock, hashGatewayMock);
    });

    it("should successfully create a user", async () => {
        const result = await useCase.execute(validUserRequest);

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            const user = result.value;
            expect(user).toBeInstanceOf(User);
            expect(user.fullName.fullName).toBe("Admin User");
            expect(user.email.email).toBe("admin@school.com");
            expect(user.cnpj.getNumeric()).toBe("12345678000190");
            expect(user.password).toBe("hashedPassword123");
        }

        expect(userGatewayMock.findByCnpj).toHaveBeenCalledWith("12345678000190");
        expect(userGatewayMock.findByEmail).toHaveBeenCalledWith("admin@school.com");
        expect(hashGatewayMock.hash).toHaveBeenCalledWith("password123");
        expect(userGatewayMock.create).toHaveBeenCalled();
    });

    it("should return Left with InvalidFullNameException if the full name is invalid", async () => {
        const invalidRequest = { ...validUserRequest, fullName: "ab" };
        const result = await useCase.execute(invalidRequest);

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(InvalidFullNameException);

        expect(userGatewayMock.findByCnpj).not.toHaveBeenCalled();
        expect(userGatewayMock.findByEmail).not.toHaveBeenCalled();
        expect(hashGatewayMock.hash).not.toHaveBeenCalled();
        expect(userGatewayMock.create).not.toHaveBeenCalled();
    });

    it("should return Left with InvalidCnpjException if the CNPJ is invalid", async () => {
        const invalidRequest = { ...validUserRequest, cnpj: "invalid_cnpj" };
        const result = await useCase.execute(invalidRequest);

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(InvalidCnpjException);

        expect(userGatewayMock.findByCnpj).not.toHaveBeenCalled();
    });

    it("should return Left with InvalidEmailException if the email is invalid", async () => {
        const invalidRequest = { ...validUserRequest, email: "invalid_email" };
        const result = await useCase.execute(invalidRequest);

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(InvalidEmailException);

        expect(userGatewayMock.findByEmail).not.toHaveBeenCalled();
    });

    it("should return Left with BadRequestException if CNPJ already exists", async () => {
        // override mock to return an existing user
        userGatewayMock.findByCnpj.mockResolvedValueOnce({ id: "some-id" } as any);

        const result = await useCase.execute(validUserRequest);

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(BadRequestException);
        if (result.isLeft() && result.value instanceof BadRequestException) {
             expect(result.value.message).toBe("CNPJ já cadastrado");
        }

        expect(userGatewayMock.findByCnpj).toHaveBeenCalledWith("12345678000190");
        expect(hashGatewayMock.hash).not.toHaveBeenCalled();
        expect(userGatewayMock.create).not.toHaveBeenCalled();
    });

    it("should return Left with BadRequestException if Email already exists", async () => {
        userGatewayMock.findByEmail.mockResolvedValueOnce({ id: "some-id" } as any);

        const result = await useCase.execute(validUserRequest);

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(BadRequestException);
        if (result.isLeft() && result.value instanceof BadRequestException) {
             expect(result.value.message).toBe("Email já cadastrado");
        }

        expect(userGatewayMock.findByEmail).toHaveBeenCalledWith("admin@school.com");
        expect(hashGatewayMock.hash).not.toHaveBeenCalled();
        expect(userGatewayMock.create).not.toHaveBeenCalled();
    });

    it("should return Left with an Exception if CreateUserFactory.build fails", async () => {
        jest.spyOn(CreateUserFactory, 'build').mockReturnValueOnce(left(new InvalidFullNameException()));

        const result = await useCase.execute(validUserRequest);

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(InvalidFullNameException);

        jest.restoreAllMocks();
    });
});
