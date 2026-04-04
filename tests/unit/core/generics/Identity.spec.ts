import Identity from "@/core/generics/Identity";

describe("Identity", () => {
    it("should generate a random UUID if no value is provided", () => {
        const id = new Identity();
        expect(id.valueId).toBeDefined();
        // UUID format check
        expect(id.valueId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it("should use the provided value", () => {
        const value = "custom-id-123";
        const id = new Identity(value);
        expect(id.valueId).toBe(value);
    });

    it("should evaluate equality correctly", () => {
        const id1 = new Identity("123");
        const id2 = new Identity("123");
        const id3 = new Identity("456");

        expect(id1.equals(id2)).toBe(true);
        expect(id1.equals(id3)).toBe(false);
    });
});
