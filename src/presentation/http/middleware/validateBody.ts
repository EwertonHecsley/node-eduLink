import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodType } from 'zod';

export function validateBody<T extends ZodType>(schema: T) {
  return async (req: FastifyRequest, res: FastifyReply) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).send({
        message: 'Invalid body',
        errors: result.error.issues,
      });
    }
    req.body = result.data;
  };
}
