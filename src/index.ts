import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import healthCheckRoute from './presentation/http/routes/healthCheckRoute';
import userRouter from './presentation/http/routes/user';

const app = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

app.register(helmet, {
  global: true,
});
app.register(cors, {
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
});

app.register(healthCheckRoute);

app.register(
  async (instance) => {
    await userRouter.register(instance);
  },
  { prefix: '/api' },
);

export default app;
