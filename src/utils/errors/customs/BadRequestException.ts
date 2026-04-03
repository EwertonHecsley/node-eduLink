import { GenericError } from "../GenericExceptionError";

export class BadRequestException extends GenericError{
    constructor(message:string = 'Requisição inválida.'){
        super(message,400);
        this.name = 'BadRequest';
    }
}