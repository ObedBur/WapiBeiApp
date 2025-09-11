const express = require('express');
const path = require('path');
const app = express();
const mount = '/WapiBeiApp';
app.use(mount, express.static(path.join(__dirname, 'dist')));
app.get(mount + '/*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
app.listen(3000, ()=> console.log('http://localhost:3000' + mount));