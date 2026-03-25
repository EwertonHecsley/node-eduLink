import { GenericError } from "../GenericExceptionError";

export class InvalidCnpjException extends GenericError{
    constructor(message:string = 'CNPJ Invalido.'){
        super(message,400);
        this.name = 'InvalidCnpj';
    }
}