import { FullName } from "@/core/domain/objectValues/FullName";
import { InvalidFullNameException } from "@/utils/errors/customs/InvalidNameException";

// Fix the exception name imported above based on how it's actually exported if needed, 
// using InvalidFullNameException as per FullName.ts

describe("FullName Value Object", () => {
    it("should return a valid FullName object when a valid string is provided", () => {
        const result = FullName.create("John Doe");

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            const name = result.value;
            expect(name.fullName).toBe("John Doe");
        }
    });

    it("should normalize the FullName by trimming and collapsing multiple spaces", () => {
        const input = "   John    Doe   Smith   ";
        const result = FullName.create(input);

        expect(result.isRight()).toBe(true);
        expect((result.value as FullName).fullName).toBe("John Doe Smith");
    });

    it("should evaluate equality correctly for the same names", () => {
        const name1 = FullName.create("John Doe").value as FullName;
        const name2 = FullName.create("  John   Doe  ").value as FullName;

        expect(name1.equals(name2)).toBe(true);
    });

    describe("Invalid inputs", () => {
        it("should return InvalidFullNameException when input is undefined or null", () => {
            expect(FullName.create(undefined as any).isLeft()).toBe(true);
            expect(FullName.create(null as any).isLeft()).toBe(true);
            expect(FullName.create(null as any).value).toBeInstanceOf(InvalidFullNameException);
        });

        it("should return InvalidFullNameException when input is not a string", () => {
            expect(FullName.create(12345 as any).isLeft()).toBe(true);
        });

        it("should return InvalidFullNameException when name length is less than MIN_LENGTH (3)", () => {
            // "ab" has length 2. Normalized.
            const result = FullName.create("ab");
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBeInstanceOf(InvalidFullNameException);
        });

        it("should return InvalidFullNameException when name length is greater than MAX_LENGTH (255)", () => {
            const longName = "a".repeat(256);
            const result = FullName.create(longName);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBeInstanceOf(InvalidFullNameException);
        });
    });
});
