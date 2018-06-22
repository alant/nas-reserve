<template>
  <v-container grid-list-md text-xs-center>
    <v-slide-y-transition mode="out-in">
      <v-layout row wrap align-center justify-center>
        <v-flex xs3>
          <v-card justify-center height="200px">
            <v-card-text class="px-0">
              {{ $t('message.currentPriceInfo') }} {{price}} NAS
            </v-card-text>
              <v-layout row>
                <v-flex xs3>
                  <v-subheader>
                    {{ $t("message.quantity") }}
                  </v-subheader>
                </v-flex>
                <v-flex xs9>
                  <v-subheader>
                    <v-text-field v-model="tokenNumbers" type="number"
                              placeholder="0"/>
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
const HttpRequest = require('nebulas').HttpRequest;
const Wallet = require('nebulas');
const NebPay = require('nebpay');

const neb = new Wallet.Neb();
neb.setRequest(new HttpRequest('https://testnet.nebulas.io'));
const nebPay = new NebPay();
const toAddress = 'n1jEnfDcwFdjseYTz7yLgd6LsgS7Hmfoueb';
const gasLimit = 200000;
const gasPrice = 1000000;

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
          this.price = result / (10 ** 18);
        });
    },
    buy() {
      console.log(`${this.tokenNumbers} is going to be bought.`);
      const serialNumber = nebPay.call(
        toAddress,
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
