/* eslint-disable no-unused-vars */
const { DateTime } = require("luxon");

const dateFormat = "yyyy-MM-dd HH:mm:ss.SSS"
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
            console.log("step 1")
            var reservationStart = DateTime.fromFormat(r.start, dateFormat)
            var reservationEnd = DateTime.fromFormat(r.end, dateFormat)

            // console.log(`Res Start: ${reservationStart.toISO()}`)
            // console.log(`Start: ${startTime.toISO()}`)
            // console.log(`End: ${startTime.plus({minutes: machine.duration}).toISO()}`)
            // console.log(`Res End: ${reservationEnd.toISO()}`)

            if((reservationStart >= startTime) && (reservationStart < startTime.plus({minutes: machine.duration}))) {
              console.log("Reservation conflict @ " + startTime.toISO())
              reserved = true
              break;
            }

            if((reservationEnd > startTime) && (reservationEnd <= startTime.plus({minutes: machine.duration}))) {
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
            color: "blue",
            timed: true,
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