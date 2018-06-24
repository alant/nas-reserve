<template>
  <v-container grid-list-md text-xs-center>
    <v-layout row wrap align-center justify-center>
      <v-flex xs3>
        <v-card justify-center>
          <v-card-text class="px-0">
            {{ $t('message.myAccountBalance') }} {{balance}} NAS
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row wrap align-center justify-center>
      <v-flex xs6>
        <v-card-text class="text-md-left">
          {{ $t('message.orderDoneMsg') }}
        </v-card-text>
        <v-data-table :headers="ordersHeaders" :items="doneOrders" class="elevation-1">
          <template slot="items" slot-scope="props">
            <td class="text-xs-right">{{ props.item.playId }}</td>
            <td class="text-xs-right">{{ props.item.orderType }}</td>
            <td class="text-xs-right">{{ props.item.amount }}</td>
            <td class="text-xs-right">{{ props.item.price }}</td>
            <td class="text-xs-right">{{ props.item.time }}</td>
          </template>
        </v-data-table>
      </v-flex>
      <v-flex xs6>
        <v-card-text class="text-md-left">
           {{ $t('message.orderPendingMsg') }}
        </v-card-text>
        <v-data-table :headers="ordersHeaders" :items="pendingOrder" class="elevation-1">
          <template slot="items" slot-scope="props">
            <td class="text-xs-right">{{ props.item.playId }}</td>
            <td class="text-xs-right">{{ props.item.orderType }}</td>
            <td class="text-xs-right">{{ props.item.amount }}</td>
            <td class="text-xs-right">{{ props.item.price }}</td>
            <td class="text-xs-right">{{ props.item.time }}</td>
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
      buyDoneOrderList: [],
      sellDoneOrderList: [],
      buyPendingOrderList: [],
      sellPendingOrderList: [],
      ordersHeaders: [
        {
          text: this.$t('message.playId'),
          align: 'left',
          sortable: false,
          value: 'playId'
        },
        { text: this.$t('message.orderType'), value: 'orderType' },
        { text: this.$t('message.amount'), value: 'amount' },
        { text: this.$t('message.price'), value: 'price' },
        { text: this.$t('message.time'), value: 'time' },
      ],
      doneOrders: [
        {
          playId: 'Player #411',
          orderType: this.$t('message.buyOrderType'),
          playerAddr: 'n1b...',
          orderId: 0,
          amount: 100,
          price: 1.59,
          time: '6/20/2018, 9:05:00 PM'
        }
      ],
      pendingOrder: [
        {
          playId: 'Player #511',
          orderType: this.$t('message.sellOrderType'),
          playerAddr: 'n1b...',
          orderId: 0,
          amount: 100,
          price: 1.59,
          time: '6/20/2018, 9:05:00 PM'
        }
      ]
    };
  },
  methods: {
    getNRTBalance() {
      this.balance = 0;
    },
    getRMBBalance() {
      this.balance = 0;
    },
    beforeMount() {
      this.getNRTBalance();
      this.getRMBBalance();
    }
  }
};
</script>
