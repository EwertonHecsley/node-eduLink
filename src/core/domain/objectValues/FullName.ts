import type { Either} from "@/utils/either";
import { left, right } from "@/utils/either";
import { InvalidFullNameException } from "@/utils/errors/customs/InvalidNameException";

export class FullName{
    private readonly value:string;
    private static MAX_LENGTH = 255;
    private static MIN_LENGTH = 3;

    private constructor(fullName:string){
        this.value = fullName;
        Object.freeze(this);
    }

    static create(input:string):Either<InvalidFullNameException,FullName>{
        if(!input || typeof input !== 'string'){
            return left(new InvalidFullNameException());
        }

        const normalizedName = this.normalize(input);

        if(!this.isValid(normalizedName)){
            return left (new InvalidFullNameException());
        }

        return right(new FullName(normalizedName));
    }

    private static normalize(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, ' ');
    }

    get fullName():string{
        return this.value;
    }

    public equals(other: FullName): boolean {
    return this.value === other.fullName;
  }

    private static isValid(value: string): boolean {
        if (value.length < this.MIN_LENGTH) {
    return false;
    }

    if (value.length > this.MAX_LENGTH) {
      return false;
    }

    return true;
  }
}