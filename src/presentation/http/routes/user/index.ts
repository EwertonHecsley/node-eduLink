import { UserController } from '../../controllers/user/UserController';
import { UserRoutes } from './UserRoute';
import { UserPrismaRepository } from '@/infra/database/prisma/repository/user/UserPrismaRepository';

const userRepository = new UserPrismaRepository();
const userController = new UserController(userRepository);
const userRouter = new UserRoutes(userController);

export default userRouter;
