import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const mount = '/WapiBeiApp';

app.use(mount, express.static(path.join(__dirname, 'dist')));

// catch-all for the mounted path using RegExp
app.get(new RegExp('^' + mount + '(?:/.*)?$'), (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000, () => console.log('http://localhost:3000' + mount));