import { GenericError } from "../GenericExceptionError";

export class NotFoundException extends GenericError{
    constructor(message:string = 'Não encontrado.'){
        super(message,404);
        this.name = 'NotFound';
    }
}