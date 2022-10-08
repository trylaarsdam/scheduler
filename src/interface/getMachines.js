const client = require("./pocketbase").client

module.exports = {getMachines, getTypes}

async function getMachines() {
  let machines = await client.records.getFullList("machines", 100, {})
  console.log(machines)
  return machines
}

async function getTypes() {
  let types = await client.records.getFullList("machine_types", 100, {})
  console.log(types)
  return types
}