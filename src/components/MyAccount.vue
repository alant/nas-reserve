<template>
  <v-container grid-list-md text-xs-center>
    <v-layout row wrap align-center justify-center>
      <v-flex xs3>
        <v-card justify-center>
          <v-card-text class="px-0">
            {{ $t('message.myAccountBalance') }}
          </v-card-text>
          <v-layout row>
            <v-flex xs3>
              <v-subheader>NAS:</v-subheader>
            </v-flex>
            <v-flex xs3>
              <v-subheader>{{nrtBalance}}</v-subheader>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs3>
              <v-subheader>RMB:</v-subheader>
            </v-flex>
            <v-flex xs3>
              <v-subheader>{{rmbBalance}}</v-subheader>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row wrap align-center justify-center>
      <v-flex xs6>
        <v-card-text class="text-md-left">
          {{ $t('message.orderDoneMsg') }}
        </v-card-text>
        <v-data-table :headers="[
          { text: this.$t('message.coin'), value: 'coin'},
          { text: this.$t('message.orderType'), value: 'orderType' },
          { text: this.$t('message.amount'), value: 'amount' },
          { text: this.$t('message.price'), value: 'price' },
          { text: this.$t('message.time'), value: 'time' },
          ]" :items="doneOrders" hide-actions :no-data-text="$t('message.noDataAvailable')" class="elevation-1">
          <template slot="items" slot-scope="props">
            <td class="text-xs-left">{{ props.item.coin }}</td>
            <td class="text-xs-left">{{ props.item.isBuy ? $t('message.buyOrderType'): $t('message.sellOrderType') }}
            </td>
            <td class="text-xs-left">{{ props.item.amount }}</td>
            <td class="text-xs-left">{{ props.item.price }}</td>
            <td class="text-xs-left">{{ $d(props.item.time, 'long', this.lang) }}</td>
            <div v-if="props.item.status === '1'">
              <v-icon light right>check_circle</v-icon>
            </div>
          </template>
        </v-data-table>
      </v-flex>
      <v-flex xs7>
        <v-card-text class="text-md-left">
          {{ $t('message.orderPendingMsg') }}
        </v-card-text>
        <v-data-table :headers="[
          { text: this.$t('message.coin'), value: 'coin'},
          { text: this.$t('message.orderType'), value: 'isBuy' },
          { text: this.$t('message.amount'), value: 'amount' },
          { text: this.$t('message.price'), value: 'price' },
          { text: this.$t('message.time'), value: 'time' },
          ]" :items="pendingOrders" hide-actions :no-data-text="$t('message.noDataAvailable')" class="elevation-1">
          <template slot="items" slot-scope="props">
            <td class="text-xs-left">{{ props.item.coin }}</td>
            <td class="text-xs-left">{{ props.item.isBuy ? $t('message.buyOrderType'): $t('message.sellOrderType') }}
            </td>
            <td class="text-xs-left">{{ props.item.amount }}</td>
            <td class="text-xs-left">{{ props.item.price }}</td>
            <td class="text-xs-left">{{ $d(props.item.time, 'long', this.lang) }}</td>
            <td class="text-xs-left">
              <v-btn icon class="mx-0" @click="cancelOrder(props.item)">
                {{ $t("message.cancel") }}
              </v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
    <check-tx v-model="checkTxDialog" :TXData="txData" />
  </v-container>
</template>

<script>
import CheckTX from './CheckTX';

export default {
  name: 'MyInfo',
  components: {
    'check-tx': CheckTX
  },
  data() {
    return {
      nrtBalance: 0,
      rmbBalance: 0,
      doneOrders: [],
      pendingOrders: [],
      checkTxDialog: false
    };
  },
  methods: {
    getNRTBalance() {
      console.log('=> myAccount getNRTBalance');
      this.getBalance(true);
    },

    getRMBBalance() {
      console.log('=> myAccount getRmbBalance');
      this.getBalance(false);
    },

    getBalance(isNRT) {
      console.log('=> myAccount getBalance');
      const contractAddress = isNRT ? this.$contracts[0] : this.$contracts[1];
      const call = {
        function: 'balanceOf',
        args: JSON.stringify([this.$account])
      };
      this.$neb.api
        .call(
          this.$account,
          contractAddress,
          0,
          '0',
          this.$gasPrice,
          this.$gasLimit,
          call
        )
        .then((resp) => {
          // if (resp.execute_err.length > 0) {
          //   throw new Error(resp.execute_err);
          // }
          console.log(`====> balanceOf : ${JSON.stringify(resp)}`);
          // const result = JSON.parse(resp.result);
          console.log(`${isNRT ? 'NRT' : 'RMB'} getBalance: ${resp.result}`);
          // if (!result) {
          //   throw new Error('访问合约API出错');
          // }
          if (isNRT) {
            this.nrtBalance = JSON.parse(resp.result);
          } else {
            this.rmbBalance = JSON.parse(resp.result) / 100;
          }
        });
    },

    getOrderEntry(currentOrder, isNRT) {
      const tmp = {};
      if (isNRT) {
        tmp.coin = 'NRT';
        tmp.amount = 1;
      } else {
        tmp.coin = 'RMBnt';
        tmp.amount = currentOrder.orderAmount / 100;
      }
      tmp.isBuy = currentOrder.type === '1';
      tmp.orderId = currentOrder.id;
      const base = 10 ** 16;
      tmp.price = currentOrder.price / base;
      tmp.time = new Date(currentOrder.timeStamp * 1000);
      tmp.status = currentOrder.status;
      return tmp;
    },

    getMyOrders() {
      console.log(`=> myAccount getMyOrders: ${this.$account}`);
      const call = {
        function: 'getMyOrders',
        args: JSON.stringify([this.$account])
      };

      const CompletedOrders = [];
      const PendingOrders = [];
      let doneCount = 0;

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
          console.log(
            `====> MyAccount NRT getMyOrders : ${JSON.stringify(resp)}`
          );
          if (resp.result.length === 0) {
            console.log('Exchange getBuyOrderIds result is empty');
          } else {
            const result = JSON.parse(resp.result);
            // console.log(`=> => my NRT orders:: ${result}`);

            for (let i = 0; i < result.length; i += 1) {
              const tmp = this.getOrderEntry(result[i], true);
              if (result[i].status === '0') {
                PendingOrders.push(tmp);
              } else {
                CompletedOrders.push(tmp);
              }
            }

            doneCount += 1;
            if (doneCount === 2) {
              this.doneOrders = CompletedOrders;
              this.pendingOrders = PendingOrders;
            }
          }

          if (
            resp.execute_err.length > 0 &&
            resp.execute_err !== 'insufficient balance'
          ) {
            throw new Error(resp.execute_err);
          }
        });

      this.$neb.api
        .call(
          this.$account,
          this.$contracts[1],
          0,
          '0',
          this.$gasPrice,
          this.$gasLimit,
          call
        )
        .then((resp) => {
          console.log(
            `====> MyAccount RMB getMyOrders : ${JSON.stringify(resp)}`
          );
          if (resp.result.length === 0) {
            console.log('Exchange getBuyOrderIds result is empty');
          } else {
            const result = JSON.parse(resp.result);
            // console.log(`=> => my RMBnt orders:: ${result}`);

            for (let i = 0; i < result.length; i += 1) {
              const tmp = this.getOrderEntry(result[i], false);

              if (result[i].status === '0') {
                PendingOrders.push(tmp);
              } else if (result[i].status === '1') {
                CompletedOrders.push(tmp);
              } else {
                console.log('Order is canceled');
              }
            }

            doneCount += 1;
            if (doneCount === 2) {
              this.doneOrders = CompletedOrders;
              this.pendingOrders = PendingOrders;
            }
          }

          if (
            resp.execute_err.length > 0 &&
            resp.execute_err !== 'insufficient balance'
          ) {
            throw new Error(resp.execute_err);
          }
        });

      this.doneOrders = [
        {
          isBuy: true,
          playerAddr: 'n1b...',
          orderId: 0,
          amount: 100,
          price: 1.59,
          time: '6/20/2018, 9:05:00 PM'
        }
      ];

      this.pendingOrders = [
        {
          isBuy: false,
          playerAddr: 'n1b...',
          orderId: 0,
          amount: 99,
          price: 1.55,
          time: '6/22/2018, 9:05:00 PM'
        }
      ];
    },
    cancelOrder(entry) {
      console.log(`canceling: ${JSON.stringify(entry)}`);
      const contract =
        entry.coin === 'NRT' ? this.$contracts[0] : this.$contracts[1];
      const callArgs = JSON.stringify([entry.orderId]);
      const callFunction = 'cancelOrder';
      this.$nebPay.call(contract, 0, callFunction, callArgs, {
        listener: (data) => {
          if (
            JSON.stringify(data) === '"Error: Transaction rejected by user"'
          ) {
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
    this.getNRTBalance();
    this.getRMBBalance();
    this.getMyOrders();
  }
};
</script>
