import { ListAllUsersUseCase } from '@/application/useCases/user/List';
import { UserGateway } from '@/core/domain/user/ports/UserGateway';
import { User } from '@/core/domain/user/entity/User';

describe('ListAllUsersUseCase', () => {
  let userGatewayMock: jest.Mocked<UserGateway>;
  let useCase: ListAllUsersUseCase;

  beforeEach(() => {
    userGatewayMock = {
      findAll: jest.fn(),
    } as unknown as jest.Mocked<UserGateway>;

    useCase = new ListAllUsersUseCase(userGatewayMock);
  });

  it('should successfully return a list of users', async () => {
    const dummyUsers = [
      { id: '1', fullName: 'User 1' },
      { id: '2', fullName: 'User 2' },
    ];
    userGatewayMock.findAll.mockResolvedValueOnce(
      dummyUsers as unknown as User[],
    );

    const result = await useCase.execute();

    expect(result).toEqual(dummyUsers);
    expect(userGatewayMock.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return an empty array if no users exist', async () => {
    userGatewayMock.findAll.mockResolvedValueOnce([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(userGatewayMock.findAll).toHaveBeenCalledTimes(1);
  });
});
