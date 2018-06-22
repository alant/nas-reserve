<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <v-flex xs12 sm6>
          <v-card>
            <v-card-title primary-title>
              <div>
                <div>
                  <div v-html="$t('message.nasrdesc')"></div>
                  <br> {{ $t('message.pricenow') }}: {{price}} NAS
                </div>
              </div>
            </v-card-title>
            <v-card-actions>
              <v-btn color="primary" v-on:click="buy">{{ $t('message.buyBtn') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-slide-y-transition>
    <check-tx v-model="checkTxDialog" :TXData="txData" />
  </v-container>
</template>

<script>
import CheckTX from './CheckTX';

export default {
  name: 'Home',
  components: {
    'check-tx': CheckTX
  },
  data() {
    return {
      price: 0,
      checkTxDialog: false,
      txData: null
    };
  },
  methods: {
    getPrice() {
      const call = {
        function: 'getCurrentPrice',
        args: '[]'
      };
      this.$neb.api
        .call(
          this.$account.getAddressString(),
          this.$contractAddr,
          0,
          '0',
          this.$gasPrice,
          this.$gasLimit,
          call
        )
        .then((resp) => {
          if (resp.execute_err.length > 0) {
            throw new Error(resp.execute_err);
          }
          const nasBase = 10 ** 18;
          const result = JSON.parse(resp.result) / nasBase;
          if (!result) {
            throw new Error('访问合约API出错');
          }
          this.price = result;
        });
    },
    buy() {
      console.log('==> buy buy buy');
      this.$nebPay.call(this.$contractAddr, this.price, 'buyOneShare', '[]', {
        listener: (data) => {
          console.log(`==> data return: ${JSON.stringify(data)}`);
          if (JSON.stringify(data) === 'Error: Transaction rejected by user') {
            console.log('=> transaction rejected');
            return;
          }
          if (data.txhash) {
            const txhash = data.txhash;
            console.log(`=> this transaction's hash: ${txhash}`);
            this.txData = data;
            this.checkTxDialog = true;
          } else {
            console.log('=> transaction failed');
          }
        }
      });
    }
  },
  beforeMount() {
    this.getPrice();
  }
};
</script>
c
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
