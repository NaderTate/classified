import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "@/lib/encryption.js";

describe("encryption", () => {
  it("encrypts and decrypts a password correctly", () => {
    const plaintext = "MyS3cur3P@ssw0rd!";
    const { encryptedPassword, iv } = encrypt(plaintext);

    expect(encryptedPassword).toBeDefined();
    expect(iv).toBeDefined();
    expect(encryptedPassword).not.toBe(plaintext);

    const decrypted = decrypt(encryptedPassword, iv);
    expect(decrypted).toBe(plaintext);
  });

  it("produces different ciphertexts for the same plaintext", () => {
    const plaintext = "SamePassword";
    const result1 = encrypt(plaintext);
    const result2 = encrypt(plaintext);

    expect(result1.encryptedPassword).not.toBe(result2.encryptedPassword);
    expect(result1.iv).not.toBe(result2.iv);
  });

  it("fails to decrypt with wrong IV", () => {
    const { encryptedPassword } = encrypt("test");
    const { iv: wrongIv } = encrypt("other");

    expect(() => decrypt(encryptedPassword, wrongIv)).toThrow();
  });

  it("handles unicode and special characters", () => {
    const plaintext = "p@$$wörd🔒中文";
    const { encryptedPassword, iv } = encrypt(plaintext);
    expect(decrypt(encryptedPassword, iv)).toBe(plaintext);
  });
});
