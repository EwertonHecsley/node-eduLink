import { User } from "../entity/User";

export abstract class UserGateway {
    abstract create(user: User): Promise<User>;
    abstract findAll(): Promise<User[]>;
    abstract findByCnpj(cnpj: string): Promise<User | null>;
    abstract findByEmail(email: string): Promise<User | null>;
    abstract findById(id: string): Promise<User | null>;
    abstract update(user: User): Promise<User>;
    abstract delete(id: string): Promise<void>;
}