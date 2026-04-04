import { User } from '@/core/domain/user/entity/User';
import { UserGateway } from '@/core/domain/user/ports/UserGateway';

export class ListAllUsersUseCase {
  constructor(private readonly userGateway: UserGateway) {}

  async execute(): Promise<User[]> {
    return await this.userGateway.findAll();
  }
}
