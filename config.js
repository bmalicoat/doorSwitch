const fs = require('fs');

function config() {

    this.filename = '';
    this.values = {};

    this.initialize = function (fileToUse) {
        this.filename = fileToUse;
        this.load();
    }

    this.load = function () {
        if (fs.existsSync(this.filename)) {
            this.values = require(this.filename);
        } else {
            fs.writeFileSync(this.filename, '{}');
        }
    }

    this.updateValue = function (name, value) {
        this.values[name] = value;
    }

    this.updateValueAndSave = function (name, value) {
        this.values[name] = value;
        fs.writeFileSync(this.filename, JSON.stringify(this.values, null, 2));
    }

    this.save = function () {
        fs.writeFileSync(this.filename, JSON.stringify(this.values, null, 2));
    }
}

module.exports = config;