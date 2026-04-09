import { FastifyInstance } from 'fastify';

export async function healthCheckRoute(app: FastifyInstance) {
  app.get('/health', async () => {
    return { status: 'ok' };
  });
}

export default healthCheckRoute;
