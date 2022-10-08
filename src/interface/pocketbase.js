// require('cross-fetch/polyfill');
// global.EventSource = require('eventsource');

const PocketBase = require('pocketbase/cjs');
const client = new PocketBase('http://127.0.0.1:8090');

module.exports = {auth, logout, client}

async function auth(email, password) {
  var response = null
  try {
    response = await client.users.authViaEmail(email, password);
  }
  catch (e) {
    response = e
  }
  return response
}

function logout() {
  client.authStore.clear();
}