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
                    <v-text-field disabled v-model="tokenNumbers" type="number"
                              placeholder="1"/>
                  </v-subheader>
                </v-flex>
              </v-layout>
            <v-btn color="success" v-on:click="buy">{{ $t('message.buyBtn') }}</v-btn>
          </v-card>
        </v-flex>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script>

export default {
  name: 'HelloWorld',
  data() {
    return {
      price: 0,
      tokenNumbers: 1
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
      console.log(`${this.tokenNumbers} is going to be bought.`);
      const serialNumber = this.$nebPay.call(
        this.$contracts[0],
        this.price,
        'buyOneShare',
        '[]',
        {
          listener: (data) => {
            if (
              JSON.stringify(data) === 'Error: Transaction rejected by user'
            ) {
              // if (errorHandler) {
              //   errorHandler('您拒绝了这笔交易');
              // }
              console.log('transaction rejected');
              return;
            }
            if (data.txhash) {
              const txhash = data.txhash;
              console.log(`this transaction's hash: ${txhash}`);
              // (sendTxHandler || showSuccessInfo || function() {})(data); // 不结束promise，为了等待链上确认结果
              // promise = waitTxResponse(txhash);
              // promise.then(
              //   function(data) {
              //     if (data && data.from) {
              //       window.currentUserAddress = data.from;
              //     }
              //     if (txConfirmHandler) {
              //       txConfirmHandler(data);
              //     }
              //   },
              //   function(err) {
              //     errorHandler(err);
              //   }
              // );
            } else {
              console.log('transaction failed');
              // if (errorHandler) {
              //   errorHandler(data);
              // }
            }
          }
        }
      );
      console.log(`${serialNumber} is returned from buy()`);
    }
  },
  beforeMount() {
    this.getPrice();
  }
};
</script>
