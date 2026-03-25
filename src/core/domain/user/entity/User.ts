import Entity from "@/core/generics/Entity";
import type { Email } from "../../objectValues/Email";

export type UserProps = {
    fullName:string;
    cnpj:string;
    email:Email;
    password:string;
    cretedAt:Date;
}

export class User extends Entity<UserProps>{}