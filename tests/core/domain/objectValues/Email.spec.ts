import { Email } from "@/core/domain/objectValues/Email";
import { InvalidEmailException } from "@/utils/errors/customs/InvalidEmailException";

describe("Email Value Object", () => {
    it("should return a valid Email object when a valid email string is provided", () => {
        const input = "Valid.User@example.com";
        const result = Email.create(input);

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            const email = result.value;
            // Should normalize to lowercase and trim spaces
            expect(email.email).toBe("valid.user@example.com");
        }
    });

    it("should normalize email with spaces trimming", () => {
        const input = "   user@domain.com   ";
        const result = Email.create(input);
        
        expect(result.isRight()).toBe(true);
        expect((result.value as Email).email).toBe("user@domain.com");
    });

    it("should evaluate equality correctly for the same Email addresses", () => {
        const email1 = Email.create("test@example.com").value as Email;
        const email2 = Email.create(" TEST@example.com ").value as Email;

        expect(email1.equals(email2)).toBe(true);
    });

    describe("Invalid inputs", () => {
        it("should return InvalidEmailException when input is undefined or null", () => {
            expect(Email.create(undefined as any).isLeft()).toBe(true);
            expect(Email.create(null as any).isLeft()).toBe(true);
            expect(Email.create(undefined as any).value).toBeInstanceOf(InvalidEmailException);
        });

        it("should return InvalidEmailException when input is not a string", () => {
            expect(Email.create(12345 as any).isLeft()).toBe(true);
        });

        it("should return InvalidEmailException when email length is less than 5", () => {
            expect(Email.create("a@b").isLeft()).toBe(true); // length 3
        });

        it("should return InvalidEmailException when email length is greater than 254", () => {
            const longLocalPart = "a".repeat(250);
            const result = Email.create(`${longLocalPart}@b.com`);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBeInstanceOf(InvalidEmailException);
        });

        it("should return InvalidEmailException when email does not have exactly one '@' symbol", () => {
            expect(Email.create("noatsymbol.com").isLeft()).toBe(true);
            expect(Email.create("two@at@symbols.com").isLeft()).toBe(true);
        });

        it("should return InvalidEmailException when local part or domain is empty", () => {
            expect(Email.create("@domain.com").isLeft()).toBe(true); // !localPart
            expect(Email.create("user@").isLeft()).toBe(true); // !domain
        });

        it("should return InvalidEmailException when local part is longer than 64 characters", () => {
            const longLocalPart = "a".repeat(65);
            expect(Email.create(`${longLocalPart}@domain.com`).isLeft()).toBe(true);
        });

        it("should return InvalidEmailException when domain starts or ends with a dot '.'", () => {
            expect(Email.create("user@.domain.com").isLeft()).toBe(true);
            expect(Email.create("user@domain.com.").isLeft()).toBe(true);
        });

        it("should return InvalidEmailException when domain contains consecutive dots '..'", () => {
            expect(Email.create("user@domain..com").isLeft()).toBe(true);
        });

        it("should return InvalidEmailException when email fails general regex validation", () => {
            // Regex enforces no consecutive dots in local part, and specific character sets
            expect(Email.create("us..er@domain.com").isLeft()).toBe(true); // fails ^(?!.*\.\.)
            expect(Email.create("user domain@domain.com").isLeft()).toBe(true); // spaces invalid
            expect(Email.create("user@domain.c").isLeft()).toBe(true); // domain TLD needs at least 2 chars
        });
    });
});
