const createLibp2p = require("./createLibp2p.js");
const fs = require("fs");
const PeerId = require("peer-id");
const path = require("path");
const pipe = require("it-pipe");
const { getCipherAndInitVect, getHash } = require("../crypto");
const { ipcMain, dialog } = require("electron");

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
        let peerAccountNumber = "";

        const { stream } = await node.dialProtocol(peer.id, "/send-file/1.0.0");

        await pipe(
          fileStream.pipe(cipher).pipe(appendInitVectAndFileHash),
          // fileStream,
          stream
        );

        const [fileName, fileType] = getFileNameAndTypeFromFilePath(filepath);

        win.webContents.send("file-sent-successfully", {
          fileHash,
          fileName,
          fileType,
          storedIn: peer.id.toB58String(),
          storedMetaMaskNumber: peerAccountNumber,
        });

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
