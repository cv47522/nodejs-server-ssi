const path = require('path');
const fs = require('fs').promises;
// const fs = require('fs');

const ssiDecoder = require('./ssiDecoder');
const ssiDirectiveHandler = require('./ssiDirectiveHandler');

/**
 * Resolve .shtml
 * file {string} 文件路径
 * options {object} 参数
 *      data 运行时参数
 *      root ssi执行根路径
 */
async function parse(file, options) {
    // clone options to optionsDict
    // let optionsDict = Object.assign({}, options);
    let optionsDict = options || {};
    return new Promise(async (resolve, reject) => {
        // resolve file to an absolute file path, if root is null, create an empty string
        if(optionsDict.root) file = path.resolve(optionsDict.root || '', file);
        optionsDict.file = file;

        try {
            const data = await fs.readFile(file, 'utf8');
            let result = await ssiDirectiveHandler(data, optionsDict);
            resolve(result);
        } catch(err) {
            reject(err);
        }

        // fs.readFile(file, 'utf8', async (err, data) => {
        //     if(err) {
        //         reject && reject(err);
        //     }
        //     else {
        //         let result = await ssiDirectiveHandler(data, optionsDict);
        //         resolve && resolve(result);
        //     }
        // });

    });
}

module.exports = {
    parse
};