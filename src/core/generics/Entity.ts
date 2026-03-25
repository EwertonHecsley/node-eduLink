import Identity from "./Identity";

export default class Entity<T>{
    private entityId:Identity;
    protected props:T;

    protected constructor(props:T,id?:Identity){
        this.props = props;
        this.entityId = id ?? new Identity();
    }

    get id():Identity{
        return this.entityId;
    }

    equals(entity?: Entity<T>): boolean {
    if (!entity) return false;
    return this.id.equals(entity.id);
  }
}