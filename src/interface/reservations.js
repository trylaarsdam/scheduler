const { DateTime } = require("luxon");

const client = require("./pocketbase").client

module.exports = {getAllReservations, getAvailability, getReservationsForWeek}

async function getAllReservations() {
  let reservations = await client.records.getFullList(
    "reservations",
    400, 
    {"query": `SELECT * FROM reservations`}
  )

  console.log(reservations)

  let machines = await client.records.getFullList(
    "machines",
    400,
    {"query": `SELECT * FROM machines`}
  )

  var calendarEvents = []

  for(var reservation of reservations) {
    calendarEvents.push({
      name: machines.filter((m) => m.id == reservation.machine)[0].name,
      start: new Date(reservation.start),
      end: new Date(reservation.end),
      color: "gray",
      timed: true,
      reserved: true
    });
  }

  console.log(calendarEvents)

  return calendarEvents
}

async function getReservationsForWeek() {
  let reservations = await client.records.getFullList(
    "reservations",
    400, 
    {"query": `SELECT * FROM reservations`, "filter": `start > @now`}
  )

  console.log(reservations)

  let machines = await client.records.getFullList(
    "machines",
    400,
    {"query": `SELECT * FROM machines`}
  )

  var calendarEvents = []

  for(var machine of machines) {
    let availability = machine.availability

    for(var i; i < 7; i++) { // cycle through next week of dates
      
    }
  }

  return machines
}

async function getAvailability() {
  await getReservationsForWeek()

  return 
}