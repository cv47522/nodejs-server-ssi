const path = require('path');
const fs = require('fs');

const ssiDecoder = require('./ssiDecoder');
const ssiDirectiveHandler = require('./ssiDirectiveHandler');

// 解析ssi文件,
/**
 * // 运行模板，
 * file {string} 文件路径
 * options {object} 参数
 *      data 运行时参数
 *      root ssi执行根路径
 */ 
async function parse(file, options) {
    options = Object.assign({}, options);
    return new Promise(async (resolve, reject) => {
        if(options.root) file = path.resolve(options.root || '', file);
        options.file = file;
        
        fs.readFile(file, 'utf8', async (err, data) => {
            if(err) {
                reject && reject(err);
            }
            else {
                let result = await ssiDirectiveHandler(data, options);
                resolve && resolve(result);
            }
        });

    });
}

module.exports = {
    parse
};