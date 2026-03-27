import { CNPJ } from "@/core/domain/objectValues/CNPJ";
import { InvalidCnpjException } from "@/utils/errors/customs/InvalidCnpjException";

describe("CNPJ Value Object", () => {
    it("should return a valid CNPJ object when a valid formatted CNPJ is provided", () => {
        const input = "12.345.678/0001-90";
        const result = CNPJ.create(input);

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            const cnpj = result.value;
            expect(cnpj.getNumeric()).toBe("12345678000190");
            expect(cnpj.getFormatted()).toBe("12.345.678/0001-90");
        }
    });

    it("should return a valid CNPJ object when a valid numeric-only CNPJ is provided", () => {
        const input = 12345678000190;
        const result = CNPJ.create(input);

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
            expect(result.value.getNumeric()).toBe("12345678000190");
        }
    });

    it("should evaluate equality correctly for the same CNPJs", () => {
        const cnpj1 = CNPJ.create("12.345.678/0001-90").value as CNPJ;
        const cnpj2 = CNPJ.create("12345678000190").value as CNPJ;

        expect(cnpj1.equals(cnpj2)).toBe(true);
    });

    describe("Invalid inputs", () => {
        it("should return InvalidCnpjException when input is null", () => {
            const result = CNPJ.create(null as any);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBeInstanceOf(InvalidCnpjException);
        });

        it("should return InvalidCnpjException when input is undefined", () => {
            const result = CNPJ.create(undefined as any);
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBeInstanceOf(InvalidCnpjException);
        });

        it("should return InvalidCnpjException when CNPJ length is not 14 after normalization", () => {
            const resultShort = CNPJ.create("1234567800019"); // 13 digits
            const resultLong = CNPJ.create("123456780001901"); // 15 digits

            expect(resultShort.isLeft()).toBe(true);
            expect(resultShort.value).toBeInstanceOf(InvalidCnpjException);

            expect(resultLong.isLeft()).toBe(true);
            expect(resultLong.value).toBeInstanceOf(InvalidCnpjException);
        });

        it("should return InvalidCnpjException when CNPJ consists of a repeated sequence of a single digit", () => {
            const result = CNPJ.create("00.000.000/0000-00"); // 14 zeros
            expect(result.isLeft()).toBe(true);
            expect(result.value).toBeInstanceOf(InvalidCnpjException);

            const resultOnes = CNPJ.create("11111111111111"); // 14 ones
            expect(resultOnes.isLeft()).toBe(true);
            expect(resultOnes.value).toBeInstanceOf(InvalidCnpjException);
        });
    });
});
