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
          ]" :items="doneOrders" hide-actions
          :no-data-text="$t('message.noDataAvailable')"
          class="elevation-1">
          <template slot="items" slot-scope="props">
            <td class="text-xs-left">{{ props.item.coin }}</td>
            <td class="text-xs-left">{{ props.item.isBuy ? $t('message.buyOrderType'): $t('message.sellOrderType') }}
            </td>
            <td class="text-xs-left">{{ props.item.amount }}</td>
            <td class="text-xs-left">{{ props.item.price }}</td>
            <td class="text-xs-left">{{ props.item.time }}</td>
          </template>
        </v-data-table>
      </v-flex>
      <v-flex xs6>
        <v-card-text class="text-md-left">
          {{ $t('message.orderPendingMsg') }}
        </v-card-text>
        <v-data-table :headers="[
          { text: this.$t('message.coin'), value: 'coin'},
          { text: this.$t('message.orderType'), value: 'isBuy' },
          { text: this.$t('message.amount'), value: 'amount' },
          { text: this.$t('message.price'), value: 'price' },
          { text: this.$t('message.time'), value: 'time' },
          ]" :items="pendingOrders" hide-actions
          :no-data-text="$t('message.noDataAvailable')" class="elevation-1">
          <template slot="items" slot-scope="props">
            <td class="text-xs-left">{{ props.item.coin }}</td>
            <td class="text-xs-left">{{ props.item.isBuy ? $t('message.buyOrderType'): $t('message.sellOrderType') }}
            </td>
            <td class="text-xs-left">{{ props.item.amount }}</td>
            <td class="text-xs-left">{{ props.item.price }}</td>
            <td class="text-xs-left">{{ props.item.time }}</td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'MyInfo',
  data() {
    return {
      nrtBalance: 0,
      rmbBalance: 0,
      doneOrders: [],
      pendingOrders: []
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
            this.nrtBalance = resp.result;
          } else {
            this.rmbBalance = resp.result;
          }
        });
    },

    getMyOrders() {
      console.log(`=> myAccount getMyOrders: ${this.$account}`);
      const call = {
        function: 'getMyOrders',
        args: JSON.stringify([this.$account])
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
          console.log(`====> MyAccount getMyOrders : ${JSON.stringify(resp)}`);
          if (resp.result.length === 0) {
            console.log('Exchange getBuyOrderIds result is empty');
          } else {
            const result = JSON.parse(resp.result);
            console.log(`=> => my NRT orders:: ${result}`);

            const NRTCompletedOrders = [];
            const NRTPendingOrders = [];
            for (let i = 0; i < result.length; i += 1) {
              const tmp = {};
              const currentOrder = result[i];
              tmp.coin = 'NRT';
              tmp.isBuy = (currentOrder.type === '1');
              tmp.orderId = currentOrder.id;
              tmp.amount = 1;
              const base = 10 ** 16;
              tmp.price = currentOrder.price / base;
              tmp.time = new Date(currentOrder.timeStamp * 1000);
              if (currentOrder.status === '0') {
                NRTPendingOrders.push(tmp);
              } else if (currentOrder.status === '1') {
                NRTCompletedOrders.push(tmp);
              } else {
                console.log('Order is canceled');
              }
            }

            this.doneOrders = NRTCompletedOrders;
            this.pendingOrders = NRTPendingOrders;
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
    }
  },

  beforeMount() {
    this.getNRTBalance();
    this.getRMBBalance();
    this.getMyOrders();
  }
};
</script>
