<template>
  <v-container grid-list-md text-xs-center>
    <v-slide-y-transition mode="out-in">
      <v-layout row wrap align-center justify-center>
        <v-flex xs8>
          <v-card justify-center height="200px">
            <v-card-text class="px-0">
              {{ $t('message.currentPriceInfo') }} {{price}} NAS
            </v-card-text>
            <v-layout row>
              <v-flex xs4>
                <v-subheader>
                  {{ $t("message.quantity") }}
                </v-subheader>
              </v-flex>
              <v-flex xs4>
                <v-subheader>
                  <v-text-field disabled v-model="tokenNumbers" type="number" placeholder="1" />
                </v-subheader>
              </v-flex>
            </v-layout>
            <v-btn color="success" v-on:click="buy">{{ $t('message.buyBtn') }}</v-btn>
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
  name: 'Buy',
  components: {
    'check-tx': CheckTX
  },
  data() {
    return {
      price: 0,
      tokenNumbers: 1,
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
          this.$account,
          this.$contracts[0],
          0,
          '0',
          this.$gasPrice,
          this.$gasLimit,
          call
        )
        .then((resp) => {
          if (resp.result.length === 0) {
            // console.log('Home getCurrentPrice result is empty');
          } else {
            const nasBase = 10 ** 18;
            const result = JSON.parse(resp.result) / nasBase;
            this.price = result;
          }
          if (
            resp.execute_err.length > 0 &&
            resp.execute_err !== 'insufficient balance'
          ) {
            throw new Error(resp.execute_err);
          }
        });
    },
    buy() {
      // console.log(`${this.tokenNumbers} is going to be bought.`);
      this.$nebPay.call(this.$contracts[0], this.price, 'buyOneShare', '[]', {
        listener: (data) => {
          if (data.txhash) {
            // const txhash = data.txhash;
            // console.log(`=> this transaction's hash: ${txhash}`);
            this.txData = data;
            this.checkTxDialog = true;
          }
          // if (
          //   JSON.stringify(data) === 'Error: Transaction rejected by user'
          // ) {
          //   // if (errorHandler) {
          //   //   errorHandler('您拒绝了这笔交易');
          //   // }
          //   // console.log('transaction rejected');
          //   return;
          // }
          // if (data.txhash) {
          //   // const txhash = data.txhash;
          //   // console.log(`this transaction's hash: ${txhash}`);
          //   // (sendTxHandler || showSuccessInfo || function() {})(data); // 不结束promise，为了等待链上确认结果
          //   // promise = waitTxResponse(txhash);
          //   // promise.then(
          //   //   function(data) {
          //   //     if (data && data.from) {
          //   //       window.currentUserAddress = data.from;
          //   //     }
          //   //     if (txConfirmHandler) {
          //   //       txConfirmHandler(data);
          //   //     }
          //   //   },
          //   //   function(err) {
          //   //     errorHandler(err);
          //   //   }
          //   // );
          // } else {
          //   // console.log('transaction failed');
          //   // if (errorHandler) {
          //   //   errorHandler(data);
          //   // }
          // }
        }
      });
      // console.log(`${serialNumber} is returned from buy()`);
    }
  },
  beforeMount() {
    this.getPrice();
  }
};
</script>
