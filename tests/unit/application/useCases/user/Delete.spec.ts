import { DeleteUserUseCase } from '@/application/useCases/user/Delete';
import { UserGateway } from '@/core/domain/user/ports/UserGateway';
import { BadRequestException } from '@/utils/errors/customs/BadRequestException';
import { NotFoundException } from '@/utils/errors/customs/NotFoundException';
import { User } from '@/core/domain/user/entity/User';

describe('DeleteUserUseCase', () => {
  let userGatewayMock: jest.Mocked<UserGateway>;
  let useCase: DeleteUserUseCase;

  beforeEach(() => {
    userGatewayMock = {
      findById: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<UserGateway>;

    useCase = new DeleteUserUseCase(userGatewayMock);
  });

  it('should successfully delete a user', async () => {
    // mock valid user found
    userGatewayMock.findById.mockResolvedValueOnce({
      id: 'valid-id',
    } as unknown as User);

    const result = await useCase.execute({ id: 'valid-id' });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toBeUndefined();
    }

    expect(userGatewayMock.findById).toHaveBeenCalledWith('valid-id');
    expect(userGatewayMock.delete).toHaveBeenCalledWith('valid-id');
  });

  it('should return left with BadRequestException if id is not a string', async () => {
    const result = await useCase.execute({ id: 123 as any });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(BadRequestException);

    expect(userGatewayMock.findById).not.toHaveBeenCalled();
    expect(userGatewayMock.delete).not.toHaveBeenCalled();
  });

  it('should return left with BadRequestException if id is an empty string', async () => {
    const result = await useCase.execute({ id: '' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(BadRequestException);

    expect(userGatewayMock.findById).not.toHaveBeenCalled();
    expect(userGatewayMock.delete).not.toHaveBeenCalled();
  });

  it('should return left with NotFoundException if user is not found', async () => {
    userGatewayMock.findById.mockResolvedValueOnce(null);

    const result = await useCase.execute({ id: 'non-existent-id' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundException);

    expect(userGatewayMock.findById).toHaveBeenCalledWith('non-existent-id');
    expect(userGatewayMock.delete).not.toHaveBeenCalled();
  });
});
