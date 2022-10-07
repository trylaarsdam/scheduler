require('cross-fetch/polyfill');
global.EventSource = require('eventsource');

const PocketBase = require('pocketbase/cjs');
const express = require("express");
const path = require("path")
const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Scheduler app listening at http://localhost:${port}`)
})
app.use("/api/users", require("./routes/users.js"));
app.use(express.static(path.join(__dirname, "..", "dist")));

const client = new PocketBase('http://127.0.0.1:8090');
client.admins.authViaEmail(require("./credentials.json").email, require("./credentials.json").password);

// route /api/users to ./routes/users.js
app.use((req, res, next) => { //send all other requests to react app
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});