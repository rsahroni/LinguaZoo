const fs = require('fs');

module.exports.readVersion = function (contents) {
    return JSON.parse(contents).expo.version;
};

module.exports.writeVersion = function (contents, version) {
    const json = JSON.parse(contents);
    json.expo.version = version;
    return JSON.stringify(json, null, 2) + '\n';
};