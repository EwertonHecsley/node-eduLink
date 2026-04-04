import { FindUserUseCase } from '@/application/useCases/user/Find';
import { UserGateway } from '@/core/domain/user/ports/UserGateway';
import { BadRequestException } from '@/utils/errors/customs/BadRequestException';
import { NotFoundException } from '@/utils/errors/customs/NotFoundException';
import { User } from '@/core/domain/user/entity/User';

describe('FindUserUseCase', () => {
  let userGatewayMock: jest.Mocked<UserGateway>;
  let useCase: FindUserUseCase;

  beforeEach(() => {
    userGatewayMock = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserGateway>;

    useCase = new FindUserUseCase(userGatewayMock);
  });

  it('should successfully find a user', async () => {
    const dummyUser = { id: 'valid-id', fullName: 'Test Name' };
    userGatewayMock.findById.mockResolvedValueOnce(
      dummyUser as unknown as User,
    );

    const result = await useCase.execute({ id: 'valid-id' });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toEqual(dummyUser);
    }

    expect(userGatewayMock.findById).toHaveBeenCalledWith('valid-id');
  });

  it('should return left with BadRequestException if id is not a string', async () => {
    const result = await useCase.execute({ id: null as any });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(BadRequestException);

    expect(userGatewayMock.findById).not.toHaveBeenCalled();
  });

  it('should return left with BadRequestException if id is an empty string', async () => {
    const result = await useCase.execute({ id: '' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(BadRequestException);

    expect(userGatewayMock.findById).not.toHaveBeenCalled();
  });

  it('should return left with NotFoundException if user is not found', async () => {
    userGatewayMock.findById.mockResolvedValueOnce(null);

    const result = await useCase.execute({ id: 'non-existent-id' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundException);

    expect(userGatewayMock.findById).toHaveBeenCalledWith('non-existent-id');
  });
});
