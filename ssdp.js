const SSDPServer = require('node-ssdp').Server;
const ssdp = new SSDPServer();

function initialize(serverName) {
    ssdp.addUSN(serverName);
    ssdp.start()
        .catch(e => {
            console.log(`Failed to start ssdp for ${serverName}`, e)
        }).then(() => {
            console.log(`Started ssdp for ${serverName}`);
        })
        ;
}

process.on('SIGHUP', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGCONT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
    console.log('stopping ssdp');
    ssdp.stop();
}

module.exports = {
    initialize: initialize
}

