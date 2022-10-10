<template>
  <v-app id="schedule">
    <v-app-bar app flat dark>
      <v-container class="py-0 fill-height">
        <v-avatar class="mr-10" tile size="42">
          <img src="https://toddr.org/assets/images/t-logo.png" alt="Todd Rylaarsdam" />
        </v-avatar>

        <v-btn v-for="link in links" :key="link" text>
          {{ link }}
        </v-btn>

        <v-spacer></v-spacer>
      </v-container>
    </v-app-bar>

    <v-main class="grey darken-3" style="margin-top: -64px">
      <v-container style="margin-top: -100px">
        <v-card-title style="color: white">
          <h1>Shop Schedule</h1>
        </v-card-title>
        <v-row>
          <v-col cols="2">
            <v-sheet rounded="lg" dark>
              <v-list color="transparent" dark>
                <v-list-item><h2>Your Quotas</h2></v-list-item>
                <v-list-item link dark v-for="quota in quotas" :key="quota.id">
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ quota.type }}: {{ quota.remaining }}hr/{{
                        quota.total
                      }}hr
                    </v-list-item-title>
                    <v-progress-linear
                      color="teal"
                      buffer-value="0"
                      :value="(quota.remaining / quota.total) * 100"
                      stream
                    ></v-progress-linear>
                  </v-list-item-content>
                </v-list-item>

                <v-divider class="my-2"></v-divider>

                <v-list-item link color="grey lighten-4" @click="refreshCal">
                  <v-list-item-content>
                    <v-list-item-title> Refresh </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-col>

          <v-col>
            <v-sheet height="64">
              <v-toolbar flat dark>
                <v-menu bottom right>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      outlined
                      dark
                      v-bind="attrs"
                      v-on="on"
                      style="margin-right: 2%"
                    >
                      <span>{{ typeToLabel[type] }}</span>
                      <v-icon right> mdi-menu-down </v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="type = 'day'">
                      <v-list-item-title>Day</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="type = 'week'">
                      <v-list-item-title>Week</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <v-btn outlined dark class="mr-4" @click="setToday">
                  Today
                </v-btn>
                <v-btn dark fab text small @click="prev">
                  <v-icon small> mdi-chevron-left </v-icon>
                </v-btn>
                <v-btn fab text small dark @click="next">
                  <v-icon small> mdi-chevron-right </v-icon>
                </v-btn>
                <v-toolbar-title v-if="$refs.calendar">
                  {{ $refs.calendar.title }}
                </v-toolbar-title>
                <v-spacer></v-spacer>

                <v-menu bottom right>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn outlined dark v-bind="attrs" v-on="on">
                      <span>{{ machine }}</span>
                      <v-icon right> mdi-menu-down </v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="machine = 'all'">
                      <v-list-item-title>All Machines</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="machine = 'lathe'">
                      <v-list-item-title>Lathe</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="machine = 'mill'">
                      <v-list-item-title>Mill</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="machine = 'cnc'">
                      <v-list-item-title>CNC</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-toolbar>
            </v-sheet>
            <v-sheet min-height="25vh" max-height="30vh" rounded="lg">
              <v-calendar
                dark
                ref="calendar"
                style="height: 80vh"
                first-time="07:00"
                v-model="focus"
                :events="shownEvents"
                :event-color="getEventColor"
                :type="type"
                @click:event="showEvent"
                @click:more="viewDay"
                @click:date="viewDay"
                @change="updateRange"
              ></v-calendar>
              <v-menu
                v-model="selectedOpen"
                :close-on-content-click="false"
                :activator="selectedElement"
                offset-x
              >
                <v-card min-width="350px" flat dark>
                  <v-toolbar :color="selectedEvent.color" dark>
                    <v-toolbar-title
                      v-html="selectedEvent.name"
                    ></v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon>
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </v-toolbar>
                  <v-card-text>
                    <div v-if="selectedEvent.reserved == true">
                      <span
                        ><b style="color: red"
                          >This timeslot is already occupied</b
                        ></span
                      >
                    </div>
                    <span
                      >Start: {{ selectedEvent.start }}<br />End:
                      {{ selectedEvent.end }}</span
                    >
                  </v-card-text>
                  <v-card-actions>
                    <v-btn
                      text
                      v-if="selectedEvent.reserved != true"
                      color="primary"
                      @click="selectedOpen = false"
                      @click.stop="dialog = true"
                    >
                      Reserve
                    </v-btn>
                    <v-btn text dark color="red" @click="selectedOpen = false">
                      Close
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-menu>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <v-dialog
      v-model="dialog"
      fullscreen
      hide-overlay
      dark
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title
            >{{ selectedEvent.name }} Reservation</v-toolbar-title
          >
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="dialog = false"> Reserve </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <h2>Reservation Details</h2>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <p>Start: {{ selectedEvent.start }}</p>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <p>End: {{ selectedEvent.end }}</p>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <p>Machine: {{ selectedEvent.name }}</p>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list three-line subheader>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Reservation Policies</v-list-item-title>
              <v-list-item-subtitle
                >Thou shalt show up on time. No-shows shall be publicly
                shamed.</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    links: ["Make Appointment", "Your Schedule"],
    focus: "",
    type: "week",
    typeToLabel: {
      // month: "Month",
      week: "Week",
      day: "Day",
      // "4day": "4 Days",
    },
    selectedEvent: {},
    machine: "all",
    quotas: [],
    dialog: false,
    notifications: false,
    sound: true,
    widgets: false,
    selectedElement: null,
    selectedOpen: false,
    events: [],
    shownEvents: [],
    colors: [
      "blue",
      "indigo",
      "deep-purple",
      "cyan",
      "green",
      "orange",
      "grey darken-1",
    ],
    names: ["Lathe 1", "Lathe 2", "Mill 1", "Mill 2", "Mill 3", "CNC"],
  }),
  async mounted() {
    await this.updateRange();
    this.$refs.calendar.checkChange();
    this.filterEvents();
    this.getQuotas();
  },
  watch: {
    machine: function () {
      console.log(this.events);
      if (this.machine == "all") {
        this.shownEvents = this.events;
      } else {
        this.shownEvents = this.events.filter((event) => {
          // console.log(event)
          return event.name.toLowerCase().includes(this.machine);
        });
      }
      this.$refs.calendar.checkChange();
    },
  },
  methods: {
    async refreshCal() {
      await this.updateRange();
      this.$refs.calendar.checkChange();
      this.filterEvents();
      this.getQuotas();
    },
    async getQuotas() {
      const machine = require("../interface/getMachines");
      const quota = require("../interface/quotas");
      const types = await machine.getTypes();
      this.quotas = await quota.getQuotas();
      for (var index in this.quotas) {
        this.quotas[index].type = types.filter(
          (type) => type.id == this.quotas[index].type
        )[0].name;
      }
    },
    viewDay({ date }) {
      this.focus = date;
      this.type = "day";
    },
    getEventColor(event) {
      return event.color;
    },
    filterEvents() {
      if (this.machine == "all") {
        this.shownEvents = this.events;
      } else {
        this.shownEvents = this.events.filter((event) => {
          // console.log(event)
          return event.name.toLowerCase().includes(this.machine);
        });
      }
      this.$refs.calendar.checkChange();
    },
    setToday() {
      this.focus = "";
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => (this.selectedOpen = true))
        );
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        requestAnimationFrame(() => requestAnimationFrame(() => open()));
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },
    async updateRange() {
      var events =
        await require("../interface/reservations").getAllReservations();
      var openSlots =
        await require("../interface/reservations").getReservationsForWeek();
      events = [...events, ...openSlots];

      this.events = [];
      this.events = events;
    },
    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a;
    },
  },
};
</script>
