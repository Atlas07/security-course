const R = require("ramda");
const { AES, enc } = require("crypto-js");

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
    // console.log("Given prime number is out of range");
    return false;
  }

  if (!checkPrime(p) || !checkPrime(g)) {
    // console.log("Given number is not primer");
    return false;
  }

  return true;
};

const getPublicKeyFromPrivateKey = R.curry((p, g, privateKey) => {
  if (!isArgsValid(p, g)) {
    return null;
  }

  if (privateKey <= 1 || p <= privateKey) {
    // console.log("privateKey is out of range");
    return null;
  }

  return Math.pow(g, privateKey) % p;
});

const getSharedSecret = R.curry(
  (p, privateKey, publicKey) => Math.pow(publicKey, privateKey) % p
);

module.exports = {
  getPublicKeyFromPrivateKeyPG: getPublicKeyFromPrivateKey(P, G),
  getSharedSecretP: getSharedSecret(P),
};


// * USAGE
// * Remove
// const alicePrivateKey = 61;
// const alicePublicKey = 84;
// const bobPrivateKey = 154;
// const bobPublicKey = 1944444;

// console.log(getPublicKeyFromPrivateKey(p, g, alicePrivateKey));
// console.log(getPublicKeyFromPrivateKey(p, g, bobPrivateKey));

// console.log(getSharedSecret(p, alicePrivateKey, bobPublicKey));
// console.log(getSharedSecret(p, bobPrivateKey, alicePublicKey));

// const cipherMessage = (message) => {
//   const sharedKey = getSharedSecret(23, alicePrivateKey, bobPublicKey);
//   return AES.encrypt(message, `${sharedKey}`).toString();
// };

// const decipherMessage = (message) => {
//   const sharedKey = getSharedSecret(23, bobPrivateKey, alicePublicKey);
//   return AES.decrypt(message, `${sharedKey}`).toString(enc.Utf8);
// };

// const cipheredMessage = cipherMessage("sometimes the same is different");
// console.log("cipherMessage", cipheredMessage);
// const decipheredMessage = decipherMessage(cipheredMessage);
// console.log("decipheredMessage", decipheredMessage);
