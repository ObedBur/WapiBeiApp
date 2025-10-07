const express = require('express');
const path = require('path');
const app = express();
const mount = process.env.PREVIEW_MOUNT || '/WapiBeiApp';
app.use(mount, express.static(path.join(__dirname, 'dist'), { index: false }));
// catch-all for the mounted path using RegExp (supports mount and mount/*)
app.get(new RegExp('^' + mount + '(?:/.*)?$'), (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
// redirect root to mount if mount is not '/'
if (mount !== '/') {
  app.get('/', (req, res) => res.redirect(mount));
}
const PORT = process.env.PREVIEW_PORT || 3000;
app.listen(PORT, ()=> console.log(`http://localhost:${PORT}${mount}`));