/* eslint-disable no-unused-vars */
const { DateTime } = require("luxon");
const quotas = require("./quotas")
const getMachines = require("./getMachines")

const dateFormat = "yyyy-MM-dd HH:mm:ss.SSS"
const client = require("./pocketbase").client

module.exports = {getAllReservations, getAvailability, getReservationsForWeek, createReservation}

async function createReservation(start, end, machine) {
  console.log("Start: " + typeof start)
  console.log("End: " + typeof end) 

  var machineType = (await getMachines.getMachine(machine)).type
  console.log("Machine Type: " + machineType)
  console.log("Remaining: " + (end - start))

  quotas.updateQuotaOffset(client.authStore.model.id, machineType, -(end - start) / 3600000)

  let reservation = await client.records.create("reservations", {
    start: DateTime.fromJSDate(start).toISO(),
    end: DateTime.fromJSDate(end).toISO(),
    machine: machine,
    uses_quota: true,
    user: client.authStore.model.id
  })

  return reservation
}

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
    console.log("Start: " + DateTime.fromFormat(reservation.start, dateFormat, {zone: "utc"}).toLocal().toISO())
    console.log("End: " + reservation.end)
    calendarEvents.push({
      name: machines.filter((m) => m.id == reservation.machine)[0].name,
      machine: reservation.machine,
      start: DateTime.fromFormat(reservation.start, dateFormat, {zone: "utc"}).toLocal().toJSDate(),
      end: DateTime.fromFormat(reservation.end, dateFormat, {zone: "utc"}).toLocal().toJSDate(),
      color: "red",
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
    // console.log(machine)
    for(var i = 0; i < 7; i++) { // cycle through next week of dates
      // console.log(i)
      let dayHours = availability[DateTime.now().plus({days: i}).weekday]
      let startTime = DateTime.fromISO(`${DateTime.now().plus({days: i}).toISODate()}T${dayHours[0]}`)
      let endTime = DateTime.fromISO(`${DateTime.now().plus({days: i}).toISODate()}T${dayHours[1]}`)

      while(startTime < endTime) {
        if(startTime < DateTime.now()) {
          break;
        }
        if(startTime.plus({minutes: machine.duration}) > endTime) {
          startTime = startTime.plus({minutes: machine.duration})
          break;
        }

        let reserved = false
        for (var r of reservations) {
          if(r.machine == machine.id) {
            // console.log("step 1")
            var reservationStart = DateTime.fromFormat(r.start, dateFormat, {zone: "utc"}).toLocal()
            var reservationEnd = DateTime.fromFormat(r.end, dateFormat, {zone: "utc"}).toLocal()
            
            // console.log("Res: " + r.start)
            // console.log(`Res Start: ${reservationStart.toISO()}`)
            // console.log(`Start: ${startTime.toISO()}`)
            // console.log(`End: ${startTime.plus({minutes: machine.duration}).toISO()}`)
            // console.log(`Res End: ${reservationEnd.toISO()}`)
            // console.log("\n")

            if((reservationStart > startTime) && (reservationStart < startTime.plus({minutes: machine.duration}))) {
              console.log("Reservation conflict @ " + startTime.toISO())
              reserved = true
              break;
            }

            if((reservationEnd > startTime) && (reservationEnd < startTime.plus({minutes: machine.duration}))) {
              console.log("Reservation conflict @ " + startTime.toISO())
              reserved = true
              break;
            }

            if(reservationStart.toISO() == startTime.toISO() || reservationEnd.toISO() == startTime.plus({minutes: machine.duration}).toISO()) {
              console.log("Reservation conflict @ " + startTime.toISO())
              reserved = true
              break;
            }
          }
        }

        if(!reserved) {
          calendarEvents.push({
            name: machine.name,
            start: startTime.toJSDate(),
            end: startTime.plus({minutes: machine.duration}).toJSDate(),
            color: "primary",
            timed: true,
            machine: machine.id,
            reserved: false
          })
        }
        // console.log("Old start time: " + startTime)
        startTime = startTime.plus({minutes: machine.duration})
        // console.log("New start time: " + startTime)
      }
    }
  }
  console.log(calendarEvents)
  return calendarEvents
}

async function getAvailability() {
  await getReservationsForWeek()

  return 
}