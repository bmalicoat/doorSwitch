const raspberrypi = process.platform !== 'win32';

let Gpio = function () {
    return {
        digitalWrite: function () {

        },
        on: function () {

        },
        pwmWrite: function () {

        },
        trigger: function () {

        }
    }
};

let pigpio = {
    terminate: function () {

    }
};

if (raspberrypi) {
    pigpio = require('pigpio');
    Gpio = require('pigpio').Gpio;
}

const ip = require('ip');
const path = require('path');
const express = require('express');
const exec = require('child_process').exec;
const config = require('./config.js');
const request = require('request');
const Client = require('node-ssdp').Client;
const client = new Client();

const ssdp = require('./ssdp.js');
ssdp.initialize('vvs:doorSwitch');

const doorSwitch = new Gpio(15, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.EITHER_EDGE
});

const settings = new config();
settings.initialize(path.join(__dirname, '/settings.json'));

const dir = path.join(__dirname, 'public');

const app = express();
app.use(express.static(dir));
const server = require('http').Server(app);
const io = require('socket.io')(server);

let port = settings.values.port;
let socketUpdateInterval = settings.values.socketUpdateInterval;
let doorClosed = false;
let doorSwitchTimeoutId;
let rgbIps = [];

doorSwitch.on('interrupt', (level) => {
    if (doorSwitchTimeoutId) {
        clearTimeout(doorSwitchTimeoutId);
    }

    doorSwitchTimeoutId = setTimeout(function () {
        if (level == 1) {
            doorClosed = true;
            sendRgbData(255, 0, 0);
        } else {
            doorClosed = false;
            sendRgbData(0, 255, 0);
        }

    }, 5);
});

let sendRgbData = function (r, g, b) {
    (rgbIps || []).forEach(ip => {
        var opts = {
            url: `http://${ip}/color?r=${r}&g=${g}&b=${b}`,
        };

        request(opts, function (err, res, body) {
        });
    });
};

app.get('/registerRGB', (req, res) => {
    if (!rgbIps.includes(req.query.ip)) {
        rgbIps.push(req.query.ip);
    }

    res.sendStatus(200);
});

app.get('/update', (req, res) => {
    exec('git checkout -- . && git pull', {
        cwd: __dirname
    }, function (error, stdout, stderr) {
        res.send(stdout);
    });
});

app.post('/shutdown', (req, res) => {
    if (raspberrypi) {
        exec('sudo shutdown -h now', () => { });
    }
    res.sendStatus(200);
});

app.post('/reboot', (req, res) => {
    if (raspberrypi) {
        exec('sudo reboot', () => { });
    }
    res.sendStatus(200);
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

function sendSocketData() {
    io.emit('doorSwitch', {
        doorClosed: doorClosed
    });
};

setInterval(() => {
    sendSocketData();
}, socketUpdateInterval);

server.listen(port);

process.on('SIGHUP', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGCONT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
    pigpio.terminate();
    process.exit(0);
};

let ipaddress;

client.on('response', function inResponse(headers, code, rinfo) {
    rgbIps.push(rinfo.address);
});

setTimeout(() => {
    ipaddress = ip.address();
    console.log(`Door Switch Ready! at ${ipaddress}`);
    client.search('vvs:rgb');
}, 10 * 1000);
