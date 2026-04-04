import { z } from 'zod';
import app from '.';

const logger = app.log;

export default class EnviromentValidator {
  private readonly envSchema = z
    .object({
      NODE_ENV: z.enum(['development', 'production', 'test']),
      PORT: z
        .string({ error: 'PORT is required' })
        .regex(/^\d+$/)
        .transform(Number),
      DATABASE_URL: z.string({ error: 'DATABASE_URL is required' }),
    })
    .passthrough();

  validateEnviromentsVariables(): void {
    const result = this.envSchema.safeParse(process.env);

    if (!result.success) {
      logger.error(result.error.format());
      process.exit(1);
    }

    const env = result.data;

    switch (env.NODE_ENV) {
      case 'development':
        logger.info('Environment is set to development.');
        break;
      case 'production':
        logger.info('Environment is set to production.');
        break;
      case 'test':
        logger.info('Environment is set to test.');
        break;
    }

    logger.info('Validating environment variables...');
  }
}
