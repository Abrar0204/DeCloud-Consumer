const AppendInitVect = require("./appendInitVect");
const crypto = require("crypto");
const fs = require("fs");

const getHash = (filepath) =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const rs = fs.createReadStream(filepath);
    rs.on("error", reject);
    rs.on("data", (chunk) => hash.update(chunk));
    rs.on("end", () => resolve(hash.digest("hex")));
  });

function getCipherAndInitVect(password, fileHash) {
  const initVect = crypto.randomBytes(16);

  const CIPHER_KEY = getCipherKey(password);
  const cipher = crypto.createCipheriv("aes-256-cbc", CIPHER_KEY, initVect);
  const appendInitVectAndFileHash = new AppendInitVect({ initVect, fileHash });

  return { cipher, appendInitVectAndFileHash };
}

function getDecipher(password, initVect) {
  const CIPHER_KEY = getCipherKey(password);
  const decipher = crypto.createDecipheriv("aes-256-cbc", CIPHER_KEY, initVect);

  return { decipher };
}

function getCipherKey(password) {
  return crypto.createHash("sha256").update(password).digest();
}

module.exports = {
  getCipherAndInitVect,
  getHash,
  getDecipher,
};
