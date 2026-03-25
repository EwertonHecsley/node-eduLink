import { randomUUID } from "node:crypto";

export default class Identity{
    private value:string;

    constructor(value?:string){
        this.value = value ?? randomUUID();
    }

    get valueId():string{
        return this.value;
    }

    equals(id: Identity): boolean {
    return this.valueId === id.valueId;
  }
}