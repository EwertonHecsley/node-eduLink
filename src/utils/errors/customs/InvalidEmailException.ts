import { GenericError } from "../GenericExceptionError";

export class InvalidEmailException extends GenericError{
    constructor(message:string = 'Invalid Email.'){
        super(message,400);
        this.name = 'InvalidEmail'
    }
}