// const ssi = require('./lib/ssi');

// const inputDirectory = "/tmp/test";
// const outputDirectory = "/tmp/output";
// const matcher = "/**/*.shtml";
// const includes = new ssi(inputDirectory, outputDirectory, matcher);
// includes.compile();

// const http = require('http');
// const fs = require('fs');

const express = require('express');
const app = express();
const favicon = require('serve-favicon');
const path = require('path');

const PORT = 3000;


/**
 * Enable built-in method to serve static files in the 'public' folder
 * path.join: create an absolute path to avoid running server outside the working directory
 **/
// app.use(express.static(path.join(__dirname, 'public')));
// set favicon
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')));
// set home page
app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, 'public', 'index.shtml'));
    res.sendFile(path.join(__dirname, 'public', 'abc.js'));
});

app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))

// // create a http server
// const server = http.createServer((req, res) => {
//     // check request URL
//     if (req.url == '/') {
//         fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
//             // set response header
//             res.writeHead(200, { 'Content-Type': 'text/html' });

//             // set response content
//             res.write(data);
//             res.end();
//         })
//     }
//     else
//         res.end('Invalid URL!')
// })

// server.listen(PORT);
// console.log(`Server started at http://localhost:${PORT}`);
