const fs = require('fs');
const path = require('path');

class ssiUtils {
    constructor(docRoot) {
        this.docRoot = docRoot;
    }

    resolveFullPath(currentFile, file) {
        return path.resolve(path.dirname(currentFile), file);
    }

    resolveFileSync(currentFile, includeFile) {
        const filename = this.resolveFullPath(currentFile, includeFile);
        return fs.readFileSync(filename, {encoding: "utf8"});
    }
}

module.exports = ssiUtils;