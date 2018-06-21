<template>
  <v-container grid-list-md text-xs-center>
    <v-layout row wrap justify-center>
      <v-flex xs3>
        <v-subheader>Select the coin to trade: </v-subheader>
      </v-flex>
      <v-flex xs3>
        <v-select :items="items" v-model="e1" label="Select" single-line></v-select>
      </v-flex>
    </v-layout>
    <v-layout row wrap justify-center>
      <v-flex xs5>
        <v-alert v-model="alert" type="info" dismissible>
          This is what NRT is about
        </v-alert>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs6>
        <v-card justify-start>
          <v-card-text class="px-0">Buy</v-card-text>
          <v-layout row>
            <v-flex offset-xs3 xs3>
              <v-subheader>price:
              </v-subheader>
            </v-flex>
            <v-flex xs6>
              <v-subheader>
                {{buyPrice}}
              </v-subheader>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex>
              <v-text-field v-model="buyNumbers" type="number" placeholder="0" />
            </v-flex>
          </v-layout>
          <v-btn color="green" v-on:click="buyToken">
            buy
          </v-btn>
        </v-card>
      </v-flex>
      <v-flex xs6>
        <v-card justify-start>
          <v-card-text class="px-0">Sell</v-card-text>
          <v-layout row>
            <v-flex offset-xs3 xs3>
              <v-subheader>price:
              </v-subheader>
            </v-flex>
            <v-flex xs6>
              <v-subheader>
                {{sellPrice}}
              </v-subheader>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex>
              <v-text-field v-model="sellNumbers" type="number" placeholder="0" />
            </v-flex>
          </v-layout>
          <v-btn color="red" v-on:click="sellToken">
            sell
          </v-btn>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'Exchange',
  data() {
    return {
      sellNumbers: 0,
      buyNumbers: 0,
      sellPrice: 0.12,
      buyPrice: 0.13,
      e1: null,
      items: [{ text: 'NRT' }, { text: 'USDnt' }],
      alert: true
    };
  },
  methods: {
    buyToken() {
      console.log(`Buy ${this.buyNumbers} tokens is called.`);
    },
    sellToken() {
      console.log(`Sell ${this.sellNumbers} tokens is called.`);
    }
  },
  beforeMount() {
    console.log('Before mounting.');
  }
};
</script>
