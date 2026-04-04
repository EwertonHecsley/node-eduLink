import { UpdateUserUseCase } from '@/application/useCases/user/Update';
import { left } from '@/utils/either';
import { UpdateUserFactory } from '@/application/useCases/user/factory/UpdateUserFactory';
import { UserGateway } from '@/core/domain/user/ports/UserGateway';
import { HashGateway } from '@/core/domain/user/ports/HashGateway';
import { InvalidFullNameException } from '@/utils/errors/customs/InvalidNameException';
import { BadRequestException } from '@/utils/errors/customs/BadRequestException';
import { NotFoundException } from '@/utils/errors/customs/NotFoundException';
import { User } from '@/core/domain/user/entity/User';
import { FullName } from '@/core/domain/objectValues/FullName';
import { CNPJ } from '@/core/domain/objectValues/CNPJ';
import { Email } from '@/core/domain/objectValues/Email';

describe('UpdateUserUseCase', () => {
  let userGatewayMock: jest.Mocked<UserGateway>;
  let hashGatewayMock: jest.Mocked<HashGateway>;
  let useCase: UpdateUserUseCase;

  let mockUser: User;

  beforeEach(() => {
    // Create a valid user for mocking findById
    const fullNameOrError = FullName.create('Old Name');
    const cnpjOrError = CNPJ.create('12345678000190');
    const emailOrError = Email.create('old@school.com');

    mockUser = User.create({
      fullName: fullNameOrError.value as FullName,
      cnpj: cnpjOrError.value as CNPJ,
      email: emailOrError.value as Email,
      password: 'oldpassword',
      role: 'ADM',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    jest.spyOn(mockUser, 'changeName').mockImplementation();
    jest.spyOn(mockUser, 'changeCnpj').mockImplementation();
    jest.spyOn(mockUser, 'changeEmail').mockImplementation();
    jest.spyOn(mockUser, 'changePassword').mockImplementation();

    userGatewayMock = {
      findByCnpj: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(undefined),
      create: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UserGateway>;

    hashGatewayMock = {
      hash: jest.fn().mockResolvedValue('newHashedPassword'),
      compare: jest.fn(),
    } as unknown as jest.Mocked<HashGateway>;

    useCase = new UpdateUserUseCase(userGatewayMock, hashGatewayMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should successfully update user's fields", async () => {
    const updateRequest = {
      id: 'user-id',
      fullName: 'New Name',
      email: 'new@school.com',
      password: 'newpassword',
    };

    const result = await useCase.execute(updateRequest);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toBeUndefined();
    }

    expect(userGatewayMock.findById).toHaveBeenCalledWith('user-id');
    expect(userGatewayMock.findByEmail).toHaveBeenCalledWith('new@school.com');
    expect(userGatewayMock.findByCnpj).not.toHaveBeenCalled();
    expect(hashGatewayMock.hash).toHaveBeenCalledWith('newpassword');

    expect(mockUser.changeName).toHaveBeenCalledWith('New Name');
    expect(mockUser.changeEmail).toHaveBeenCalledWith('new@school.com');
    expect(mockUser.changePassword).toHaveBeenCalledWith('newHashedPassword');
    expect(mockUser.changeCnpj).not.toHaveBeenCalled();

    expect(userGatewayMock.update).toHaveBeenCalledWith(mockUser);
  });

  it('should successfully update CNPJ without updating email', async () => {
    userGatewayMock.findByCnpj.mockResolvedValueOnce(null);

    const updateRequest = {
      id: 'user-id',
      cnpj: '98765432000198',
    };

    const result = await useCase.execute(updateRequest);

    expect(result.isRight()).toBe(true);
    expect(userGatewayMock.findByCnpj).toHaveBeenCalledWith('98765432000198');
    expect(mockUser.changeCnpj).toHaveBeenCalledWith('98765432000198');
    expect(mockUser.changeEmail).not.toHaveBeenCalled();
    expect(userGatewayMock.update).toHaveBeenCalledWith(mockUser);
  });

  it('should return left with NotFoundException if user is not found', async () => {
    userGatewayMock.findById.mockResolvedValueOnce(null);

    const result = await useCase.execute({
      id: 'non-existent-id',
      fullName: 'New Name',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundException);
    expect(userGatewayMock.update).not.toHaveBeenCalled();
  });

  it('should return left with Exception if UpdateUserFactory.validate fails', async () => {
    jest
      .spyOn(UpdateUserFactory, 'validate')
      .mockReturnValueOnce(left(new InvalidFullNameException()));

    const result = await useCase.execute({ id: 'user-id', fullName: 'ab' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidFullNameException);

    expect(userGatewayMock.findById).not.toHaveBeenCalled();
    expect(userGatewayMock.update).not.toHaveBeenCalled();
  });

  it('should return left with BadRequestException if new CNPJ already exists in another user', async () => {
    userGatewayMock.findByCnpj.mockResolvedValueOnce({
      id: 'other-user',
    } as any);

    const updateRequest = { id: 'user-id', cnpj: '98765432000198' };
    const result = await useCase.execute(updateRequest);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(BadRequestException);
    if (result.isLeft() && result.value instanceof BadRequestException) {
      expect(result.value.message).toBe('CNPJ já cadastrado');
    }

    expect(userGatewayMock.update).not.toHaveBeenCalled();
  });

  it('should return left with BadRequestException if new email already exists in another user', async () => {
    userGatewayMock.findByEmail.mockResolvedValueOnce({
      id: 'other-user',
    } as any);

    const updateRequest = { id: 'user-id', email: 'existing@school.com' };
    const result = await useCase.execute(updateRequest);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(BadRequestException);
    if (result.isLeft() && result.value instanceof BadRequestException) {
      expect(result.value.message).toBe('Email já cadastrado');
    }

    expect(userGatewayMock.update).not.toHaveBeenCalled();
  });

  it("should allow update if CNPJ and email are the same as the current user's", async () => {
    const updateRequest = {
      id: 'user-id',
      cnpj: '12345678000190', // same as current
      email: 'old@school.com', // same as current
    };

    const result = await useCase.execute(updateRequest);

    expect(result.isRight()).toBe(true);

    // It shouldn't have checked duplication
    expect(userGatewayMock.findByCnpj).not.toHaveBeenCalled();
    expect(userGatewayMock.findByEmail).not.toHaveBeenCalled();

    expect(userGatewayMock.update).toHaveBeenCalled();
  });
});
