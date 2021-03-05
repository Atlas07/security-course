// https://github.com/nathanbuchar/node-cipher/blob/HEAD/docs/using-the-node-js-api.md#options files only
const EventEmitter = require("events");
const { AES, enc } = require("crypto-js");
const nodecipher = require("node-cipher");

const { getRandomInt } = require("./utils");
const {
  getPublicKeyFromPrivateKeyPG,
  getSharedSecretP,
} = require("./diffieHellman");

const PublicKeysStorage = {};
const events = new EventEmitter();

const generatePublicPrivateKeys = function () {
  this.privateKey = getRandomInt(2, 10);
  this.publicKey = getPublicKeyFromPrivateKeyPG(this.privateKey);
};

const uploadPublicKey = function (storage) {
  storage[this.id] = this.publicKey;
};

const addClient = function (client) {
  const clientsSet = new Set(this.clients);
  clientsSet.add(client);

  this.clients = [...clientsSet];
};

const generateSessionKey = function (publicKeys, id) {
  const key = publicKeys[id];
  const sessionKey = getSharedSecretP(this.privateKey, key);

  this.sessionKeys[id] = sessionKey;
};

const sendMessage = function (id, message) {
  console.log({ message });
  const cipheredText = AES.encrypt(
    JSON.stringify(message),
    `${this.sessionKeys[id]}`
  ).toString();
  const hasClient = !!this.clients.find((client) => client === id);

  if (hasClient) {
    events.emit(`${id}-recieveMessage`, this.id, id, cipheredText);
    return;
  }

  this.clients.forEach((client) =>
    events.emit(`${client}-recieveMessage`, this.id, id, cipheredText)
  );
};

const recieveMessage = function (from, to, message) {
  console.log(`Message from ${from} recieved by ${this.id}:`);
  console.log(message);
  console.log({ from, to });

  if (to === this.id) {
    const decipheredText = AES.decrypt(
      message,
      `${this.sessionKeys[from]}`
    ).toString(enc.Utf8);
    const parsedDecipheredText = JSON.parse(decipheredText);

    console.log({ parsedDecipheredText });

    if (parsedDecipheredText.type === "password") {
      this.symmetricKeys[from] = parsedDecipheredText.text;
    }

    return;
  }

  const hasClient = !!this.clients.find((client) => client === to);

  if (hasClient) {
    events.emit(`${to}-recieveMessage`, from, to, message);
    return;
  }

  this.clients.forEach((client) =>
    events.emit(`${client}-recieveMessage`, from, to, message)
  );
};

const sendFile = function (id, filename) {
  const outputFilename = `${this.dir}${filename}.cast5`;
  nodecipher.encryptSync({
    input: filename,
    output: outputFilename,
    password: this.symmetricPassword,
  });

  const hasClient = !!this.clients.find((client) => client === id);

  if (hasClient) {
    events.emit(`${id}-recieveFile`, this.id, id, filename, outputFilename);
    return;
  }

  this.clients.forEach((client) =>
    events.emit(`${client}-recieveFile`, this.id, id, filename, outputFilename)
  );
};

const recieveFile = function (from, to, filename, filenamePath) {
  console.log(`File from ${from} recieved by ${this.id}`);
  console.log({ from, to });

  if (to == this.id) {
    const decipheredFile = nodecipher.decryptSync({
      input: filenamePath,
      output: `${this.dir}${filename}`,
      password: this.symmetricKeys[from],
    });

    console.log({ decipheredFile });
    return;
  }

  const hasClient = !!this.clients.find((client) => client === to);

  if (hasClient) {
    events.emit(`${to}-recieveFile`, from, to, filename, filenamePath);
    return;
  }

  this.clients.forEach((client) =>
    events.emit(`${client}-recieveFile`, from, to, filename, filenamePath)
  );
};

const clientA = {
  id: "VerticeA",
  publicKey: null,
  privateKey: null,
  dir: "./files/clientA/",
  symmetricPassword: "clientBPass",
  sessionKeys: {},
  symmetricKeys: {},
  clients: [],

  generatePublicPrivateKeys,
  uploadPublicKey,
  addClient,
  generateSessionKey,
  sendMessage,
  recieveMessage,
  sendFile,
  recieveFile,
};

const clientB = {
  id: "VerticeB",
  publicKey: null,
  privateKey: null,
  dir: "./files/clientB/",
  sessionKeys: {},
  symmetricKeys: {},
  symmetricPassword: "clientBPass",
  clients: [],

  generatePublicPrivateKeys,
  uploadPublicKey,
  addClient,
  generateSessionKey,
  sendMessage,
  recieveMessage,
  sendFile,
  recieveFile,
};

const clientC = {
  id: "VerticeC",
  publicKey: null,
  privateKey: null,
  dir: "./files/clientC/",
  sessionKeys: {},
  symmetricKeys: {},
  symmetricPassword: "clientCPass",
  clients: [],

  generatePublicPrivateKeys,
  uploadPublicKey,
  addClient,
  generateSessionKey,
  sendMessage,
  recieveMessage,
  sendFile,
  recieveFile,
};

clientA.generatePublicPrivateKeys();
clientB.generatePublicPrivateKeys();
clientC.generatePublicPrivateKeys();

clientA.uploadPublicKey(PublicKeysStorage);
clientB.uploadPublicKey(PublicKeysStorage);
clientC.uploadPublicKey(PublicKeysStorage);

clientA.addClient(clientB.id);
clientA.addClient(clientC.id);
clientB.addClient(clientA.id);
clientC.addClient(clientA.id);

clientA.generateSessionKey(PublicKeysStorage, clientB.id);
clientA.generateSessionKey(PublicKeysStorage, clientC.id);
clientB.generateSessionKey(PublicKeysStorage, clientA.id);
clientC.generateSessionKey(PublicKeysStorage, clientA.id);

clientC.generateSessionKey(PublicKeysStorage, clientB.id);
clientB.generateSessionKey(PublicKeysStorage, clientC.id);

events.on(`${clientA.id}-recieveMessage`, (from, to, message) =>
  clientA.recieveMessage(from, to, message)
);
events.on(`${clientB.id}-recieveMessage`, (from, to, message) =>
  clientB.recieveMessage(from, to, message)
);
events.on(`${clientC.id}-recieveMessage`, (from, to, message) =>
  clientC.recieveMessage(from, to, message)
);
events.on(`${clientA.id}-recieveFile`, (from, to, filename, filenamePath) =>
  clientA.recieveFile(from, to, filename, filenamePath)
);
events.on(`${clientB.id}-recieveFile`, (from, to, filename, filenamePath) =>
  clientB.recieveFile(from, to, filename, filenamePath)
);
events.on(`${clientC.id}-recieveFile`, (from, to, filename, filenamePath) =>
  clientC.recieveFile(from, to, filename, filenamePath)
);

// clientC.sendMessage(clientB.id, {
//   text: "Sometimes the same is different",
//   type: "message",
// });
clientC.sendMessage(clientB.id, {
  text: clientC.symmetricPassword,
  type: "password",
});
console.log('====================================');
clientC.sendFile(clientB.id, "README.md");

