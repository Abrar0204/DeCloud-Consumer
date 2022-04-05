const TCP = require("libp2p-tcp");
const Mplex = require("libp2p-mplex");
const { NOISE } = require("libp2p-noise");
const defaultsDeep = require("defaults-deep");
const libp2p = require("libp2p");
const MulticastDNS = require("libp2p-mdns");
const Gossipsub = require("libp2p-gossipsub");
const KadDHT = require("libp2p-kad-dht");

async function createLibp2p(_options) {
  const defaults = {
    modules: {
      transport: [TCP],
      streamMuxer: [Mplex],
      connEncryption: [NOISE],
      pubsub: Gossipsub,
      peerDiscovery: [MulticastDNS],
      dht: KadDHT,
    },
    config: {
      peerDiscovery: {
        mdns: {
          interval: 20e3,
          enabled: true,
        },
      },
      dht: {
        enabled: true,
      },
    },
  };

  return libp2p.create(defaultsDeep(_options, defaults));
}

module.exports = createLibp2p;
