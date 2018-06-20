<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
         The price right now is: {{price}}
         <input v-model="tokenNumbers" placeholder="0" type="number"/>Tokens
         <button v-on:click="buy">Buy</button>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script>

const HttpRequest = require('nebulas').HttpRequest;
const Wallet = require('nebulas');

export default {
  name: 'HelloWorld',
  data() {
    return {
      price: 0,
      tokenNumbers: 0
    };
  },
  methods: {
    getPrice() {
      const testAccount1 = new Wallet.Account(
        '2b779296ab0ee991a73ecc61319afff8352d171b0a8778ef623911f65d7bf5b4'
      );
      const neb = new Wallet.Neb();
      neb.setRequest(new HttpRequest('https://testnet.nebulas.io'));
      const toAddress = 'n1jEnfDcwFdjseYTz7yLgd6LsgS7Hmfoueb';
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
          const result = JSON.parse(resp.result);
          if (!result) {
            throw new Error('访问合约API出错');
          }
          this.price = result;
        });
    },
    buy() {
      console.log(`${this.tokenNumbers} is going to be bought.`);
    }
  },
  beforeMount() {
    this.getPrice();
  }
};
</script>
