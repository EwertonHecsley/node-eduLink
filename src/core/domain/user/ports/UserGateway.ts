import { User } from "../entity/User";

export abstract class UserGateway {
    abstract create(user: User): Promise<User>;
    abstract findByEmail(email: string): Promise<User | null>;
    abstract findById(id: string): Promise<User | null>;
    abstract update(user: User): Promise<User>;
    abstract delete(id: string): Promise<void>;
    abstract findAll(): Promise<User[]>;
}