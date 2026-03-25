import { GenericError } from "../GenericExceptionError";

export class InvalidFullNameException extends GenericError{
    constructor(message:string = 'Nome Invalido.'){
        super(message,400);
        this.name = 'InvalidName';
    }
}