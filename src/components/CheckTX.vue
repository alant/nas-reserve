<template>
  <v-dialog :value="value" @input="$emit('input')" max-width="500px">
    <v-card>
      <v-card-title>
        {{ $t('message.confirming') }}
      </v-card-title>
      <v-card-text>
        <div v-if="confirmMsg">{{ confirmMsg }}</div>
        <div v-else>{{ $t('message.confirmingText') }}</div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" flat @click.native="$emit('input')">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
// import EventBus from '../event-bus';

export default {
  name: 'CheckTX',
  props: ['value', 'TXData'],
  watch: {
    // disable lint here because arrow function doesn't get this context
    /* eslint-disable */
    TXData: function(newVal, oldVal) {
      /* eslint-enable */
      // console.log('Prop changed: ', newVal, ' | was: ', oldVal);
      this.confirmMsg = this.$t('message.confirmingText');
      this.tryCheckTx(10, newVal.txhash);
    }
  },
  data() {
    return {
      confirmMsg: null
    };
  },
  methods: {
    checkTransaction(seq, hash) {
      return new Promise((resolve, reject) => {
        console.log(`==>checkTransaction #: ${seq}`);
        this.$neb.api
          .getTransactionReceipt(hash)
          .then((resp) => {
            // console.log("tx receipt: " + JSON.stringify(resp));
            if (resp.status === 2) {
              // console.log('transaction not yet confirmed: status = 2 ');
              resolve(false);
            } else if (resp.status === 0) {
              // console.log(
              //   `transaction failed! status = 2 error: ${JSON.stringify(resp)}`
              // );
              // EventBus.$emit('txfailed');
              this.confirmMsg = this.$t('message.failedTX') + hash;
              reject(false);
            } else {
              console.log(`=> transaction succeeded: ${JSON.stringify(resp)}`);
              // Vue.prototype.$myAccountAddr = resp.from;
              // Vue.localStorage.set('from', resp.from);
              // console.log('transaction succeeded: ');
              this.confirmMsg = this.$t('message.successTX') + hash;
              // EventBus.$emit('txsuccess');
              resolve(true);
            }
          })
          .catch((err) => {
            console.log(`getTransactionReceipt error: ${err}`);
            this.confirmMsg = 'getTransactionReceipt error';
            reject(false);
          });
      });
    },
    timeout(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    },

    tryCheckTx(maxTry, hash) {
      return new Promise(async (resolve) => {
        /* eslint-disable no-await-in-loop */
        for (let i = 0; i < maxTry; i += 1) {
          const result = await this.checkTransaction(i + 1, hash);
          if (result) {
            resolve();
            break;
          }
          await this.timeout(3000);
        }
        /* eslint-enable no-await-in-loop */
      });
    }
  }
};
</script>
