const createLibp2p = require("./createLibp2p.js");
const fs = require("fs");
const PeerId = require("peer-id");
const path = require("path");
const pipe = require("it-pipe");
const { getCipherAndInitVect, getHash, getDecipher } = require("../crypto");
const { ipcMain, dialog } = require("electron");
const { BufferListStream } = require("bl/bl");
const appDir = path.resolve(require("os").homedir(), ".DeCloud");

const startNode = async (win) => {
  let id;
  try {
    const idJson = require(path.join(__dirname, "./peer-id.json"));
    id = await PeerId.createFromJSON(idJson);
  } catch (err) {
    id = await PeerId.create({ bits: 1024, keyType: "RSA" });
    fs.writeFile(
      path.join(__dirname, "./peer-id.json"),
      JSON.stringify(id.toJSON(), null, 2),
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
  }
  const node = await createLibp2p({
    peerId: id,
    addresses: {
      listen: ["/ip4/0.0.0.0/tcp/0"],
    },
  });

  await node.start();

  // Output this node's address
  console.log("Dialer ready, listening on:");
  node.multiaddrs.forEach((ma) => {
    console.log(ma.toString() + "/p2p/" + id.toB58String());
  });

  node.connectionManager.on("peer:connect", (connection) => {
    console.log("connected to: ", connection.remotePeer.toB58String());
  });

  ipcMain.on("logging", (data) => {
    console.log("[LOG-FROM-RENDERER]:", data);
  });

  ipcMain.on("download-file", async (_, fileData) => {
    try {
      console.log(fileData);

      const { fileName, fileType, fileHash, storedIn, splitInto } = fileData;
      const storagePeerId = PeerId.createFromB58String(storedIn);

      const { stream } = await node.dialProtocol(
        storagePeerId,
        "/decloud/get-file/1.0.0"
      );

      await pipe(
        [JSON.stringify({ fileHash, splitInto })],
        stream,
        async (source) => {
          const bl = new BufferListStream();

          for await (const msg of source) {
            bl.append(msg);
          }

          // //Remove after checking if decrypt works !!!
          let newStartingBuffer = bl._bufs[0].slice(64);
          bl._bufs[0] = newStartingBuffer;

          const initVect = bl._bufs[0].slice(0, 16);

          newStartingBuffer = bl._bufs[0].slice(16);
          bl._bufs[0] = newStartingBuffer;

          const peerPrivKey = require(path.join(__dirname, "./peer-id.json"));

          const { decipher } = getDecipher(peerPrivKey.privKey, initVect);

          const writeStream = fs.createWriteStream(
            path.join(appDir, "files", `${fileName}.${fileType}`)
          );

          bl.pipe(decipher).pipe(writeStream);
        }
      );
    } catch (err) {
      console.log(err);
    }
  });

  ipcMain.on("filepath", async (_, filesFromDrop) => {
    let filepath;

    if (filesFromDrop == null) {
      const filesFromDialog = dialog.showOpenDialogSync({
        properties: ["openFile"],
      });
      filepath = filesFromDialog[0];
    } else {
      filepath = filesFromDrop[0].path;
    }

    console.log(filepath);

    const fileStream = fs.createReadStream(filepath);
    const fileSize = fs.statSync(filepath).size + 16;

    const peerPrivKey = require(path.join(__dirname, "./peer-id.json"));

    let partitionSize = parseInt((fileSize / 3).toFixed());

    partitionSize = partitionSize < 102400 ? fileSize : partitionSize;

    console.log("FileSize,Partition Size", fileSize, partitionSize);

    const fileHash = await getHash(filepath);

    const { cipher, appendInitVectAndFileHash } = getCipherAndInitVect(
      peerPrivKey.privKey,
      fileHash
    );

    for await (let peer of node.peerStore.getPeers()) {
      try {
        const { stream } = await node.dialProtocol(
          peer.id,
          "/decloud/send-file/1.0.0"
        );

        await pipe(
          fileStream.pipe(cipher).pipe(appendInitVectAndFileHash),
          // fileStream,
          stream,
          async (source) => {
            for await (const msg of source) {
              const { accountNumber: peerAccountNumber, splitInto } =
                JSON.parse(msg.toString().trim());
              console.log(
                "[INFO] remote peer account number: ",
                peerAccountNumber
              );
              const [fileName, fileType] =
                getFileNameAndTypeFromFilePath(filepath);

              win.webContents.send("file-sent-successfully", {
                fileHash,
                fileName,
                fileType,
                storedIn: peer.id.toB58String(),
                storedMetaMaskNumber: peerAccountNumber,
                splitInto,
                fileSize: fileSize - 16,
              });
            }
          }
        );

        // for (let start = 0; start < fileSize; start += partitionSize + 1) {
        //   let end = start + partitionSize;
        //   if (start + partitionSize > fileSize) {
        //     end = fileSize - 1;
        //   }
        //   // get stream from start to start + paritionSize
        //   console.log(start, end);
        // }

        // stream.close();
      } catch (err) {
        console.log(err);
      }
    }
  });
};

const getFileNameAndTypeFromFilePath = (filepath = "") => {
  const arr = filepath.split("/");

  return arr[arr.length - 1].split(".");
};

module.exports = { startNode };
