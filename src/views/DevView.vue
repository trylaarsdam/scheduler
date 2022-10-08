<template>
  <div>
    <v-list-item style="margin: 1%" flat>
      <v-card style="padding: 2%">
        <v-list-item-content>
          <v-text-field label="Email" v-model="email"></v-text-field>
          <v-text-field
            label="Password"
            type="password"
            v-model="password"
          ></v-text-field
          ><br />
          <v-btn color="primary" @click="login">Login</v-btn>
        </v-list-item-content>
      </v-card>
    </v-list-item>
    <v-list-item style="margin: 1%" flat>
      <v-card style="padding: 2%">
        <v-list-item-content>
          <v-btn color="primary" @click="getMachines">Get Machines</v-btn>
        </v-list-item-content>
      </v-card>
    </v-list-item>
    <v-list-item style="margin: 1%" flat>
      <v-card style="padding: 2%">
        <v-list-item-content>
          <v-btn color="primary" @click="getQuotas">Get Quotas</v-btn>
        </v-list-item-content>
      </v-card>
    </v-list-item>
    <v-list-item style="margin: 1%" flat>
      <v-card style="padding: 2%">
        <v-list-item-content>
          <v-menu bottom right>
            <template v-slot:activator="{ on, attrs }">
              <v-btn outlined v-bind="attrs" v-on="on">
                <span>{{ machine }}</span>
                <v-icon right> mdi-menu-down </v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="machine = 'om1ey8bb2zb7vcg'">
                <v-list-item-title>Lathe</v-list-item-title>
              </v-list-item>
              <v-list-item @click="machine = 'rg71usyni1f4oo8'">
                <v-list-item-title>Mill</v-list-item-title>
              </v-list-item>
              <v-list-item @click="machine = 'uszs6w1qe69e22g'">
                <v-list-item-title>CNC</v-list-item-title>
              </v-list-item>
            </v-list> </v-menu
          ><br />
          <v-btn color="primary" @click="subtractFromMachine">-1</v-btn><v-btn color="primary" @click="addFromMachine">+1</v-btn>
        </v-list-item-content>
      </v-card>
    </v-list-item>
    <v-list-item style="margin: 1%" flat>
      <v-card style="padding: 2%">
        <v-list-item-content>
          <v-btn color="primary" @click="getAvailability">Get Availability</v-btn>
        </v-list-item-content>
      </v-card>
    </v-list-item>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: "",
      password: "",
      machine: "uszs6w1qe69e22g",
    };
  },
  methods: {
    async login() {
      const auth = require("../interface/pocketbase").auth;

      var result = await auth(this.email, this.password);
      if (
        result.toString() == "ClientResponseError 400: Failed to authenticate."
      ) {
        alert("Invalid credentials.");
      } else {
        alert(JSON.stringify(result));
      }
    },
    async getMachines() {
      const machines = require("../interface/getMachines");

      var result = await machines.getMachines();
      alert(JSON.stringify(result));
    },
    async getQuotas() {
      const quotas = require("../interface/quotas");

      var result = await quotas.getQuotas();
      alert(JSON.stringify(result));
    },
    async subtractFromMachine() {
      const quotas = require("../interface/quotas")

      var result = await quotas.updateQuotaOffset(null, this.machine, -1)
      alert(JSON.stringify(result))
    },
    async addFromMachine() {
      const quotas = require("../interface/quotas")

      var result = await quotas.updateQuotaOffset(null, this.machine, 1)
      alert(JSON.stringify(result))
    },
    async getAvailability() {
      const reservations = require("../interface/reservations")

      var result = await reservations.getAvailability()
      alert(JSON.stringify(result))
    }
  },
};
</script>
