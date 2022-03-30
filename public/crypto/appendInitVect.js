const { Transform } = require("stream");

class AppendInitVect extends Transform {
  constructor({ initVect, fileHash }, opts) {
    super(opts);
    this.initVect = initVect;
    this.fileHash = fileHash;
    this.appended = false;
  }

  _transform(chunk, encoding, cb) {
    if (!this.appended) {
      this.push(this.fileHash);
      this.push(this.initVect);
      this.appended = true;
    }
    this.push(chunk);
    cb();
  }
}

module.exports = AppendInitVect;
