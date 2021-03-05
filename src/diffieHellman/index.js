const R = require("ramda");
const { AES, enc } = require("crypto-js");

const { getRandomInt } = require("../utils");

// TODO: take from ENV file
const P = 23;
const G = 5;

const range = (min, max) => {
  const ret = [];

  for (var i = min; i <= max; i++) {
    ret.push(i);
  }

  return ret;
};

const checkPrime = (v) => {
  const max = ~~Math.sqrt(v);

  return range(2, max).every((i) => v % i !== 0);
};

const isArgsValid = (p, g) => {
  if (p <= 0) {
    console.log("Given prime number is out of range");
    return false;
  }

  if (!checkPrime(p) || !checkPrime(g)) {
    console.log("Given number is not primer");
    return false;
  }

  return true;
};

const getPublicKeyFromPrivateKey = R.curry((p, g, privateKey) => {
  if (!isArgsValid(p, g)) {
    return null;
  }

  if (privateKey <= 1 || p <= privateKey) {
    console.log("privateKey is out of range");
    return null;
  }
  return Math.pow(g, privateKey) % p;
});

const getPublicKeyFromPrivateKeyPG = getPublicKeyFromPrivateKey(P, G);

const getSharedSecret = R.curry(
  (p, privateKey, publicKey) => Math.pow(publicKey, privateKey) % p
);

const getSharedSecretP = getSharedSecret(P);

module.exports = {
  getPublicKeyFromPrivateKey,
  getPublicKeyFromPrivateKeyPG,
  getSharedSecret,
  getSharedSecretP,
};

// * USAGE
// * Remove
// const alicePrivateKey = getRandomInt(2, 10);
// const alicePublicKey = getPublicKeyFromPrivateKeyPG(alicePrivateKey);
// const bobPrivateKey = getRandomInt(2, 10);
// const bobPublicKey = getPublicKeyFromPrivateKeyPG(bobPrivateKey);

// console.log({ alicePrivateKey, alicePublicKey });
// console.log({ bobPrivateKey, bobPublicKey });
// console.log({
//   sharedAlice: getSharedSecret(P, alicePrivateKey, bobPublicKey),
//   sharedBob: getSharedSecret(P, bobPrivateKey, alicePublicKey),
// });

// const cipherMessage = (message) => {
//   const sharedKey = getSharedSecret(P, alicePrivateKey, bobPublicKey);
//   return AES.encrypt(message, `${sharedKey}`).toString();
// };

// const decipherMessage = (message) => {
//   const sharedKey = getSharedSecret(P, bobPrivateKey, alicePublicKey);
//   return AES.decrypt(message, `${sharedKey}`).toString(enc.Utf8);
// };

// const cipheredMessage = cipherMessage("sometimes the same is different");
// console.log({ cipheredMessage });
// const decipheredMessage = decipherMessage(cipheredMessage);
// console.log({ decipheredMessage });