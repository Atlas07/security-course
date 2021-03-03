// https://github.com/nathanbuchar/node-cipher/blob/HEAD/docs/using-the-node-js-api.md#options files only
const EventEmitter = require("events");
const { AES, enc } = require("crypto-js");

const { getRandomInt } = require("./utils");
const {
  getPublicKeyFromPrivateKeyPG,
  getSharedSecretP,
} = require("./diffieHellman");

const PublicKeysStorage = {};
const events = new EventEmitter();

const generatePublicPrivateKeys = function () {
  this.privateKey = getRandomInt();
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
  const cipheredText = AES.encrypt(
    message,
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

    console.log(decipheredText);
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

const clientA = {
  id: "VerticeA",
  key: null,
  publicKey: null,
  privateKey: null,
  dir: "./folder/clientA",
  symmetricKey: "",
  symmetricKeyPass: "",
  sessionKeys: {},
  clients: [],

  generatePublicPrivateKeys,
  uploadPublicKey,
  addClient,
  generateSessionKey,
  sendMessage,
  recieveMessage,

  sendFile: () => {},
};

const clientB = {
  id: "VerticeB",
  key: null,
  publicKey: null,
  privateKey: null,
  dir: "./folder/clientB",
  symmetricKey: "",
  symmetricKeyPass: "",
  sessionKeys: {},
  clients: [],

  generatePublicPrivateKeys,
  uploadPublicKey,
  addClient,
  generateSessionKey,
  sendMessage,
  recieveMessage,
};

const clientC = {
  id: "VerticeC",
  key: null,
  publicKey: null,
  privateKey: null,
  dir: "./folder/clientC",
  symmetricKey: "",
  symmetricKeyPass: "",
  sessionKeys: {},
  clients: [],

  generatePublicPrivateKeys,
  uploadPublicKey,
  addClient,
  generateSessionKey,
  sendMessage,
  recieveMessage,
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

clientC.sendMessage(clientB.id, "Sometimes the same is different");
