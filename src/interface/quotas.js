const client = require("./pocketbase").client

module.exports = {getQuotas, updateQuotaOffset, updateQuotaAbsolute}

async function getQuotas() {
  // console.log(client.authStore.model.id)
  let quotas = await client.records.getFullList(
    "quotas",
    100, 
    {"query": `SELECT * FROM quotas WHERE user=${client.authStore.model.id}`}
  )
  console.log(quotas)
  return quotas
}

async function updateQuotaOffset(userID, machineType, offset) {
  let user = userID

  if(userID == null) {
    user = client.authStore.model.id
  }

  let quota = await client.records.getFullList("quotas", 1, {"query": `SELECT * FROM quotas WHERE user=${user} AND type=${machineType}`})
  quota = quota.filter((q) => q.type == machineType)

  if(quota.length == 0) {
    return {
      "error": "No quota found"
    }
  }
  else if(quota.length == 1) {
    console.log(quota[0].remaining)
    const record = await client.records.update('quotas', quota[0].id, {
      remaining: quota[0].remaining + offset,
    });

    return record
  }
}

async function updateQuotaAbsolute(userID, machineType, value) { 
  let user = userID

  if(userID == null) {
    user = client.authStore.model.id
  }

  let quota = await client.records.getFullList("quotas", 1, {"query": `SELECT * FROM quotas WHERE user=${user} AND type=${machineType}`}).filter((q) => q.type == machineType)

  if(quota.length == 0) {
    return {
      "error": "No quota found"
    }
  }
  else if(quota.length == 1) {
    const record = await client.records.update('quotas', quota[0].id, {
      remaining: value,
    });

    return record
  }
}