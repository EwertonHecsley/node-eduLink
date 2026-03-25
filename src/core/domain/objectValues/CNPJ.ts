import{ left, right, type Either } from "@/utils/either";
import { InvalidCnpjException } from "@/utils/errors/customs/InvalidCnpjException";

export class CNPJ{
    private readonly value:string;

    private constructor(cnpj:string){
        this.value = cnpj;
        Object.freeze(this);
    }

    static create(input:string | number):Either<InvalidCnpjException,CNPJ>{
        if(input === null || input === undefined){
            return left(new InvalidCnpjException());
        }

        const raw = String(input);
        const numeric = raw.replace(/\D/g, '');

        if(!this.isValid(numeric)){
            return left(new InvalidCnpjException());
        }

        return right(new CNPJ(numeric));
    }

    getNumeric():string{
        return this.value;
    }

    getFormatted():string{
        return this.value.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
    }

    public equals(other: CNPJ): boolean {
    return this.value === other.getNumeric();
  }

    private static isValid(cnpj: string): boolean {
    if (cnpj.length !== 14) {
      return false;
    }

    // evita sequências tipo 00000000000000
    if (/^(\d)\1+$/.test(cnpj)) {
      return false;
    }

    return true;
  }
}