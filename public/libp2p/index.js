const createLibp2p = require("./createLibp2p.js");
const fs = require("fs");
const PeerId = require("peer-id");
const path = require("path");
const pipe = require("it-pipe");
const { getCipherAndInitVect, getHash, getDecipher } = require("../crypto");
const { ipcMain, dialog } = require("electron");
const { BufferListStream } = require("bl/bl");
const appDir = path.resolve(require("os").homedir(), ".DeCloud");

const getPeerId = async () => {
  const peerIdPath = path.join(__dirname, "./peer-id.json");

  try {
    if (fs.existsSync(peerIdPath)) {
      const idJson = require(peerIdPath);
      return await PeerId.createFromJSON(idJson);
    } else {
      const id = await PeerId.create({ bits: 1024, keyType: "RSA" });
      fs.writeFile(peerIdPath, JSON.stringify(id.toJSON(), null, 2), (err) => {
        if (err) {
          console.log(err);
        }
      });
      return id;
    }
  } catch (err) {
    console.log(err);
  }
};

const startNode = async (win) => {
  const id = await getPeerId();
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

  ipcMain.on("logging", (_, data) => {
    console.log("[LOG-FROM-RENDERER]:", data);
  });

  ipcMain.on("delete-file", async (_, fileData) => {
    try {
      const storagePeerId = PeerId.createFromB58String(fileData.storedIn[0]);

      const { stream } = await node.dialProtocol(
        storagePeerId,
        "/decloud/delete-file/1.0.0"
      );

      await pipe([JSON.stringify(fileData)], stream, async (source) => {
        for await (const msg of source) {
          console.log(msg.toString().trim());
        }
      });
    } catch (err) {
      console.log(err);
    }
  });

  ipcMain.on("download-file", async (_, fileData) => {
    try {
      const { fileName, fileType, fileHash, storedIn, splitInto } = fileData;

      const storagePeerId = PeerId.createFromB58String(storedIn[0]);

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
            try {
              const d = JSON.parse(msg.toString().trim());
              console.log("Not Found");
              if (d.isNotFound) {
                win.webContents.send("file-not-found", {
                  storageAddress: d.accountNumber,
                  fileUploadDate: fileData.uploadDateEnoch,
                });
                return;
              } else {
                bl.append(msg);
              }
            } catch (_) {
              bl.append(msg);
            }
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
          win.webContents.send("file-downloaded", path.join(appDir, "files"));
        }
      );
    } catch (err) {
      console.log(err);
    }
  });

  ipcMain.on("upload-file", async (_, filesFromDrop) => {
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

    const [fileName, fileType] = getFileNameAndTypeFromFilePath(filepath);

    const storageNodes = [];

    for await (let peer of node.peerStore.getPeers()) {
      try {
        // If peer doesn't support protocol go to next
        if (!peer.protocols.includes("/decloud/send-file/1.0.0")) continue;

        // If peer is not online/connected go to next
        const connection = node.connectionManager.get(peer.id);

        if (!connection) continue;

        const { stream } = await connection.newStream(
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

              storageNodes.push({
                peerAccountNumber,
                peerId: peer.id.toB58String(),
                splitInto,
              });
              console.log(
                "[INFO] remote peer account number: ",
                peerAccountNumber
              );
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

    if (storageNodes.length === 0) {
      win.webContents.send("no-nodes-found");
      return;
    }

    console.log(
      storageNodes.map((s) => s.peerId),
      storageNodes.map((s) => s.peerAccountNumber)
    );
    // win.webContents.send("file-sent-successfully", {
    //   fileHash,
    //   fileName,
    //   fileType,
    //   storedIn: storageNodes.map((s) => s.peerId),
    //   storedMetaMaskNumber: storageNodes.map((s) => s.peerAccountNumber),
    //   splitInto: storageNodes[0].splitInto,
    //   fileSize: fileSize - 16,
    // });
  });
};

const getFileNameAndTypeFromFilePath = (filepath = "") => {
  const arr = filepath.split("/");

  return arr[arr.length - 1].split(".");
};

module.exports = { startNode };
