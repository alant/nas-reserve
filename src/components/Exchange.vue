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
                <v-text-field v-model="currentPrice" type="number" placeholder="currentPrice" />
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
const HttpRequest = require('nebulas').HttpRequest;
const Wallet = require('nebulas');
// const NebPay = require('nebpay');

export default {
  name: 'Exchange',
  data() {
    return {
      currentPrice: 0,
      sellNumbers: 0,
      buyNumbers: 0,
      sellPrice: 0.12,
      buyPrice: 0.13,
      e1: 'NRT',
      items: [{ text: 'NRT', value: 'NRT' }, { text: 'RMBnt', value: 'RMBnt' }],
      alert: true
    };
  },
  methods: {
    buyToken() {
      console.log(
        `Buy ${this.buyNumbers} tokens is called. ${this.e1} is selected`
      );
    },
    sellToken() {
      console.log(`Sell ${this.sellNumbers} tokens is called.`);
    },
    getPrice() {
      console.log('=> exchange getPrice')
      const testAccount1 = new Wallet.Account(
        '2b779296ab0ee991a73ecc61319afff8352d171b0a8778ef623911f65d7bf5b4'
      );
      const neb = new Wallet.Neb();
      neb.setRequest(new HttpRequest('https://testnet.nebulas.io'));
      const toAddress = 'n1tqSiUCEqr7B5E61hJ74M1GavFE9yPH9rx';
      const gasLimit = 200000;
      const gasPrice = 1000000;

      const call = {
        function: 'getCurrentPrice',
        args: '[]'
      };
      neb.api
        .call(
          testAccount1.getAddressString(),
          toAddress,
          0,
          '0',
          gasPrice,
          gasLimit,
          call
        )
        .then((resp) => {
          if (resp.execute_err.length > 0) {
            throw new Error(resp.execute_err);
          }
          const result = JSON.parse(resp.result) / (10 ** 18);
          if (!result) {
            throw new Error('访问合约API出错');
          }

          this.currentPrice = result;
        });
    }
  },
  beforeMount() {
    console.log('=> exchange beforeMOunt');
    this.getPrice();
  }
};
</script>
