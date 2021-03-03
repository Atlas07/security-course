const {
  getPublicKeyFromPrivateKey,
  getSharedSecret,
} = require("./diffieHellman");

const privateK1 = 6;
const publicK1 = 8;
const privateK2 = 15;
const publicK2 = 19;
const p = 23;
const g = 5;

describe("getPublicKeyFromPrivateKey", () => {
  it("error if arguments are not prime", () => {
    const pK = getPublicKeyFromPrivateKey(10, 13, privateK1);

    expect(pK).toBe(null);
  });

  it("error if private key is negative", () => {
    const pK = getPublicKeyFromPrivateKey(p, g, -10);

    expect(pK).toBe(null);
  });

  it("error if private key is zero", () => {
    const pK = getPublicKeyFromPrivateKey(p, g, 0);

    expect(pK).toBe(null);
  });

  it("error if private key is one", () => {
    const pK = getPublicKeyFromPrivateKey(p, g, 1);

    expect(pK).toBe(null);
  });

  it("error if private key equals the modulus parameter p", () => {
    const pK = getPublicKeyFromPrivateKey(p, g, p);

    expect(pK).toBe(null);
  });

  it("error if private key is greater than the modulus parameter p", () => {
    const pK = getPublicKeyFromPrivateKey(p, g, p + 1);

    expect(pK).toBe(null);
  });

  it("when given a private key, returns the correct public one", () => {
    const pK = getPublicKeyFromPrivateKey(p, g, privateK1);
    expect(pK).toEqual(publicK1);
  });
});

describe("getSharedSecret", () => {
  it("shared secret from our private key and public keys", () => {
    const sharedSecret = 2;
    const sharedSecret1 = getSharedSecret(p, privateK1, publicK2);
    const sharedSecret2 = getSharedSecret(p, privateK2, publicK1);

    expect(sharedSecret1).toBe(sharedSecret2);
    expect(sharedSecret1).toBe(sharedSecret);
  });
});
