import { z } from 'zod';

export const schemaCreateUserDto = z.object({
  fullName: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .nonempty('O nome é obrigatório'),
  cnpj: z.string().nonempty('O CNPJ é obrigatório'),
  email: z.email('Email inválido').nonempty('Email é obrigatório'),
  password: z
    .string()
    .min(4, 'A senha deve ter pelo menos 4 caracteres')
    .nonempty('A senha é obrigatória'),
  role: z.string().nonempty('O nivel é obrigatório'),
});

export type CreateUserDto = z.infer<typeof schemaCreateUserDto>;

export const schemaUpdateUserDto = z.object({
  fullName: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .optional(),
  cnpj: z.string().min(1, 'CNPJ não pode ser vazio').optional(),
  email: z.email('Email inválido').optional(),
  password: z
    .string()
    .min(4, 'A senha deve ter pelo menos 4 caracteres')
    .optional(),
  role: z.string().min(1, 'O nível não pode ser vazio').optional(),
});

export type UpdateUserDto = z.infer<typeof schemaUpdateUserDto>;
