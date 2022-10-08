const client = require("./pocketbase").client

module.exports = {getMachines}

async function getMachines() {
  let machines = await client.records.getFullList("machines", 100, {})
  console.log(machines)
  return machines
}