const range = (min, max) => {
  const ret = [];

  for (var i = min; i <= max; i++) {
    ret.push(i);
  }

  return ret;
};

const checkPrime = (v) => {
  const max = ~~Math.sqrt(v);

  return range(2, max).every(i => v % i !== 0);
};

const isArgsValid = (p, g) => {
  if (p <= 0) {
    // console.log("Given prime number is out of range");
    return false
  }

  if (!checkPrime(p) || !checkPrime(g)) {
    // console.log("Given number is not primer");
    return false;
  }

  return true;
};

const getPublicKeyFromPrivateKey = (p, g, privateKey) => {
  if (!isArgsValid(p, g)) {
    return null;
  }

  if (privateKey <= 1 || p <= privateKey) {
    // console.log("privateKey is out of range");
    return null;
  }

  return Math.pow(g, privateKey) % p;
};

const getSharedSecret = (p, privateKey, publicKey) => (
  Math.pow(publicKey, privateKey) % p
);

module.exports = {
  getPublicKeyFromPrivateKey,
  getSharedSecret,
};

// USAGE
// const p = 23;
// const g = 5;

// const alicePrivateKey = 6;
// const alicePublicKey = 8;
// const bobPrivateKey = 15;
// const bobPublicKey = 19;

// console.log(getPublicKeyFromPrivateKey(p, g, alicePrivateKey));
// console.log(getPublicKeyFromPrivateKey(p, g, bobPrivateKey));

// console.log(getSharedSecret(p, alicePrivateKey, bobPublicKey));
// console.log(getSharedSecret(p, bobPrivateKey, alicePublicKey));