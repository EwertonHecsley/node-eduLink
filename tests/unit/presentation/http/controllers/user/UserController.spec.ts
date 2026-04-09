import { UserController } from '@/presentation/http/controllers/user/UserController';
import { UserPrismaRepository } from '@/infra/database/prisma/repository/user/UserPrismaRepository';
import { FastifyRequest, FastifyReply } from 'fastify';

jest.mock('@/infra/services/hash/HashService', () => {
  return {
    HashService: jest.fn().mockImplementation(() => {
      return {
        hash: jest.fn().mockResolvedValue('hashed_password'),
        compare: jest.fn().mockResolvedValue(true),
      };
    }),
  };
});

describe('UserController', () => {
  let userController: UserController;
  let mockUserRepository: jest.Mocked<Partial<UserPrismaRepository>>;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn().mockImplementation(async (user: any) => user),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByCnpj: jest.fn().mockResolvedValue(null),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    userController = new UserController(mockUserRepository as UserPrismaRepository);

    mockRequest = {
      body: {},
      params: {},
      log: {
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      },
    } as any;

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create User', () => {

  it('should return 201 and create user successfully', async () => {
    mockRequest.body = {
      fullName: 'Valid Name',
      cnpj: '12345678000190',
      email: 'valid@example.com',
      password: 'password123',
    };

    await userController.create(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Usuário criado com sucesso',
        user: expect.objectContaining({
          fullName: 'Valid Name',
          email: 'valid@example.com',
          cnpj: '12.345.678/0001-90',
        }),
      })
    );
    expect(mockUserRepository.create).toHaveBeenCalled();
  });

  it('should return 400 when validation fails (e.g. invalid CNPJ)', async () => {
    mockRequest.body = {
      fullName: 'Valid Name',
      cnpj: 'invalid-cnpj',
      email: 'valid@example.com',
      password: 'password123',
    };

    await userController.create(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'CNPJ Invalido.' })
    );
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
  });

  describe('List Users', () => {
    it('should return 500 when use case throws', async () => {
      mockUserRepository.findAll = jest.fn().mockRejectedValue(new Error('DB Error'));
      await userController.list(mockRequest as FastifyRequest, mockReply as FastifyReply);
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Internal Error.' })
      );
    });

    it('should return 200 and list users', async () => {
      mockUserRepository.findAll = jest.fn().mockResolvedValue([]);
      await userController.list(mockRequest as FastifyRequest, mockReply as FastifyReply);
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Usuários listados com sucesso',
          users: [],
        })
      );
    });
  });

  describe('Find User', () => {
    it('should return 404 if user not found', async () => {
      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      mockUserRepository.findById = jest.fn().mockResolvedValue(null);
      await userController.find(mockRequest as FastifyRequest, mockReply as FastifyReply);
      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Usuario nao encontrado.' })
      );
    });

    it('should return 200 and the user if found', async () => {
      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440001' };
      const mockUser = {
        id: { valueId: '550e8400-e29b-41d4-a716-446655440001' },
        fullName: { fullName: 'Bob' },
        cnpj: { getFormatted: () => '11' },
        email: { email: 'a@example.com' },
        password: 'hash', role: 'ADM', createdAt: new Date(), updatedAt: new Date(),
      };
      mockUserRepository.findById = jest.fn().mockResolvedValue(mockUser);
      await userController.find(mockRequest as FastifyRequest, mockReply as FastifyReply);
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Usuário encontrado com sucesso' })
      );
    });
  });

  describe('Update User', () => {
    it('should return 404 if user to update does not exist', async () => {
      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440002' };
      mockRequest.body = { fullName: 'New Name' };
      mockUserRepository.findById = jest.fn().mockResolvedValue(null);
      await userController.update(mockRequest as FastifyRequest, mockReply as FastifyReply);
      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Usuário não encontrado.' })
      );
    });

    it('should return 204 when updated successfully', async () => {
      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440003' };
      mockRequest.body = { fullName: 'New Name' };
      const mockUser = {
        id: { valueId: '550e8400-e29b-41d4-a716-446655440003' },
        fullName: { fullName: 'Bob' },
        cnpj: { getFormatted: () => '11' },
        email: { email: 'a@example.com' },
        password: 'hash', role: 'ADM', createdAt: new Date(), updatedAt: new Date(),
        changeName: jest.fn(), changeEmail: jest.fn(), changePassword: jest.fn(), changeCnpj: jest.fn(),
      };
      mockUserRepository.findById = jest.fn().mockResolvedValue(mockUser);
      mockUserRepository.findByCnpj = jest.fn().mockResolvedValue(null);
      mockUserRepository.findByEmail = jest.fn().mockResolvedValue(null);
      mockUserRepository.update = jest.fn().mockResolvedValue(undefined);
      await userController.update(mockRequest as FastifyRequest, mockReply as FastifyReply);
      expect(mockReply.status).toHaveBeenCalledWith(204);
    });
  });

  describe('Delete User', () => {
    it('should return 404 if user to delete does not exist', async () => {
      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440004' };
      mockUserRepository.findById = jest.fn().mockResolvedValue(null);
      await userController.delete(mockRequest as FastifyRequest, mockReply as FastifyReply);
      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Usuario nao encontrado.' })
      );
    });

    it('should return 204 when deleted successfully', async () => {
      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440005' };
      const mockUser = { id: { valueId: '550e8400-e29b-41d4-a716-446655440005' } };
      mockUserRepository.findById = jest.fn().mockResolvedValue(mockUser);
      mockUserRepository.delete = jest.fn().mockResolvedValue(undefined);
      await userController.delete(mockRequest as FastifyRequest, mockReply as FastifyReply);
      expect(mockReply.status).toHaveBeenCalledWith(204);
    });
  });

});
