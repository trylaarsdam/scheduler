const client = require("./pocketbase").client

module.exports = {getMachines, getTypes, getMachine}

async function getMachines() {
  let machines = await client.records.getFullList("machines", 100, {})
  console.log(machines)
  return machines
}

async function getMachine(machine) {
  let machines = await client.records.getFullList("machines", 1, {"query": `SELECT * FROM machines WHERE id=${machine}`})
  console.log(machines)
  return machines[0]
}

async function getTypes() {
  let types = await client.records.getFullList("machine_types", 100, {})
  console.log(types)
  return types
}