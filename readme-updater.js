const fs = require('fs');

module.exports.readVersion = function (contents) {
    const matches = contents.match(/version-([0-9]+\.[0-9]+\.[0-9]+)-blue\.svg/);
    return matches[1];
};

module.exports.writeVersion = function (contents, version) {
    const newContents = contents.replace(/version-([0-9]+\.[0-9]+\.[0-9]+)-blue\.svg/g, `version-${version}-blue.svg`);
    return newContents;
};