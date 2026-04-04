import Entity from "@/core/generics/Entity";
import Identity from "@/core/generics/Identity";

// Concrete implementation for testing abstract Entity
class TestEntity extends Entity<{ name: string }> {
    constructor(props: { name: string }, id?: Identity) {
        super(props, id);
    }

    get name(): string {
        return this.props.name;
    }
}

describe("Entity", () => {
    it("should create an entity with an auto-generated Identity if none is provided", () => {
        const entity = new TestEntity({ name: "Test" });
        expect(entity.id).toBeInstanceOf(Identity);
        expect(entity.id.valueId).toBeDefined();
        expect(entity.name).toBe("Test");
    });

    it("should create an entity with the provided Identity", () => {
        const id = new Identity("custom-id");
        const entity = new TestEntity({ name: "Test" }, id);
        expect(entity.id).toBe(id);
        expect(entity.id.valueId).toBe("custom-id");
    });

    it("should evaluate equality correctly based on Identity", () => {
        const id1 = new Identity("123");
        const id2 = new Identity("123");
        const id3 = new Identity("456");

        const entity1 = new TestEntity({ name: "A" }, id1);
        const entity2 = new TestEntity({ name: "B" }, id2); // Same ID, different props -> should be equal
        const entity3 = new TestEntity({ name: "A" }, id3); // Different ID, same props -> not equal

        expect(entity1.equals(entity2)).toBe(true);
        expect(entity1.equals(entity3)).toBe(false);
    });

    it("should return false if compared with undefined or null", () => {
        const entity = new TestEntity({ name: "Test" });
        expect(entity.equals(undefined as any)).toBe(false);
        expect(entity.equals(null as any)).toBe(false);
    });
});
