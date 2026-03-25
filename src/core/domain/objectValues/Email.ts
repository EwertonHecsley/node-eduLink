import {type Either, left, right } from "@/utils/either";
import { InvalidEmailException } from "@/utils/errors/customs/InvalidEmailException";

export class Email{
    private readonly value:string;

    private constructor(email:string){
        this.value = email;
        Object.freeze(this);
    }

    static create(email:string):Either<InvalidEmailException,Email>{
        if(!email || typeof  email !== 'string'){
            return left(new InvalidEmailException());
        };

        const normalizedEmail = email.trim().toLowerCase();

        if(!this.isValid(normalizedEmail)){
            return left(new InvalidEmailException());
        }

        return right(new Email(normalizedEmail));
    }

    get email():string{
        return this.value;
    }

    equals(other: Email): boolean {
    return this.value === other.email;
  }


    private static isValid(email: string): boolean {
    if (email.length < 5 || email.length > 254) {
      return false;
    }

    const parts = email.split('@');

    if (parts.length !== 2) {
      return false;
    }

    const [localPart, domain] = parts;

    if (!localPart || !domain) {
      return false;
    }

    if (localPart.length > 64) {
      return false;
    }

    if (domain.startsWith('.') || domain.endsWith('.')) {
      return false;
    }

    if (domain.includes('..')) {
      return false;
    }

    const emailRegex =
      /^(?!.*\.\.)([a-z0-9.!#$%&'*+/=?^_`{|}~-]+)@([a-z0-9-]+\.)+[a-z]{2,}$/i;

    return emailRegex.test(email);
  }
}