import { FastifyInstance } from 'fastify';
import { UserController } from '../../controllers/user/UserController';
import { validateBody } from '../../middleware/validateBody';
import {
  schemaCreateUserDto,
  schemaUpdateUserDto,
} from '../../controllers/user/dto/schemaUserDto';

export class UserRoutes {
  constructor(private readonly controller: UserController) {}

  async register(app: FastifyInstance) {
    app.post('/v1/user', {
      preHandler: validateBody(schemaCreateUserDto),
      handler: this.controller.create.bind(this.controller),
    });

    app.get('/v1/user', {
      handler: this.controller.list.bind(this.controller),
    });

    app.get('/v1/user/:id', {
      handler: this.controller.find.bind(this.controller),
    });

    app.put('/v1/user/:id', {
      preHandler: validateBody(schemaUpdateUserDto),
      handler: this.controller.update.bind(this.controller),
    });

    app.delete('/v1/user/:id', {
      handler: this.controller.delete.bind(this.controller),
    });
  }
}
