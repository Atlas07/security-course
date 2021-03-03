const crypto = require("crypto");

const generateKeyPair = () => {
  const ecdh = crypto.createECDH("secp521r1");
  const key = ecdh.generateKeys("hex");

  return {
    ecdh,
    key,
    publicKey: ecdh.getPublicKey("hex"),
    privateKey: ecdh.getPrivateKey("hex"),
  };
};

const getRandomInt = (max = 1000000) =>
  Math.floor(Math.random() * Math.floor(max));

module.exports = {
  generateKeyPair,
  getRandomInt,
};
