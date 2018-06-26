<template>
  <v-container grid-list-md text-xs-center>
    <v-layout row wrap align-center justify-center>
      <v-flex xs3 class="text-xs-right">
        <v-subheader class="fluid text-xs-right">{{ $t("message.selectCoin") }}: </v-subheader>
      </v-flex>
      <v-flex xs3>
        <v-select :items="supportedTokens" v-model="selectedToken" label="Select" single-line />
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
          <v-card-text class="px-0">{{$t("message.buyCard")}}</v-card-text>
          <v-layout row>
            <v-flex offset-xs2 xs4>
              <v-subheader>{{ $t("message.price") }} (NAS):
              </v-subheader>
            </v-flex>
            <v-flex xs6>
              <v-subheader>
                <v-text-field v-model="currentPrice" type="number" placeholder="1" />
              </v-subheader>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex offset-xs2 xs4>
              <v-subheader>{{ $t("message.quantity") }}
              </v-subheader>
            </v-flex>
            <v-flex>
              <v-subheader>
                <v-text-field v-model="buyNumbers" type="number" placeholder="1" />
              </v-subheader>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex offset-xs2 xs4>
              <v-subheader>{{ $t("message.total") }} (NAS):
              </v-subheader>
            </v-flex>
            <v-flex xs6>
              <v-subheader>
                <v-text-field disabled v-model="totalNASBuy" type="number" />
              </v-subheader>
            </v-flex>
          </v-layout>
          <v-btn color="green" v-on:click="buyToken">
            {{$t("message.buyCard")}}
          </v-btn>
        </v-card>
      </v-flex>
      <v-flex xs6>
        <v-card justify-start>
          <v-card-text class="px-0">{{ $t("message.sellCard") }}</v-card-text>
          <v-layout row>
            <v-flex offset-xs2 xs4>
              <v-subheader>{{ $t("message.price") }} (NAS):
              </v-subheader>
            </v-flex>
            <v-flex xs6>
              <v-subheader>
                <v-text-field v-model="currentPrice" type="number" placeholder="1" />
              </v-subheader>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex offset-xs2 xs4>
              <v-subheader>{{ $t("message.quantity") }}
              </v-subheader>
            </v-flex>
            <v-flex xs6>
              <v-subheader>
                <v-text-field v-model="sellNumbers" type="number" placeholder="1" />
              </v-subheader>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex offset-xs2 xs4>
              <v-subheader>{{ $t("message.total") }} (NAS):
              </v-subheader>
            </v-flex>
            <v-flex xs6>
              <v-subheader>
                <v-text-field disabled v-model="totalNASSell" type="number" />
              </v-subheader>
            </v-flex>
          </v-layout>
          <v-btn color="red" v-on:click="sellToken">
            {{ $t("message.sellCard") }}
          </v-btn>
        </v-card>
      </v-flex>
      <v-flex xs6>
        <v-subheader> {{ $t("message.buyOrders") }} </v-subheader>
        <v-data-table :headers="[
          {
            text: this.$t('message.playId'),
            align: 'left',
            sortable: false,
            value: 'playId'
          },
          { text: this.$t('message.amount'), value: 'amount' },
          { text: this.$t('message.price'), value: 'price' },
          { text: this.$t('message.time'), value: 'time' },
          { text: '', value: 'playId', sortable: false }
          ]" :items="buyOrders" hide-actions class="elevation-1">
          <template slot="items" slot-scope="props">
            <td class="text-xs-right">{{ props.item.playId }}</td>
            <td class="text-xs-right">{{ props.item.amount }}</td>
            <td class="text-xs-right">{{ props.item.price }}</td>
            <td class="text-xs-right">{{ props.item.time }}</td>
            <td class="justify-center">
              <v-btn icon class="mx-0" @click="sellFromBuyList(props.item)">
                {{ $t("message.sellCard") }}
                <v-icon dark right>check_circle</v-icon>
              </v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
      <v-flex xs6>
        <v-subheader> {{ $t("message.sellOrders") }} </v-subheader>
        <v-data-table :headers="[
          {
            text: this.$t('message.playId'),
            align: 'left',
            sortable: false,
            value: 'playId'
          },
          { text: this.$t('message.amount'), value: 'amount' },
          { text: this.$t('message.price'), value: 'price' },
          { text: this.$t('message.time'), value: 'time' },
          { text: '', value: 'playId', sortable: false }
          ]" :items="sellOrders" hide-actions class="elevation-1">
          <template slot="items" slot-scope="props">
            <td class="text-xs-right">{{ props.item.playId }}</td>
            <td class="text-xs-right">{{ props.item.amount }}</td>
            <td class="text-xs-right">{{ props.item.price }}</td>
            <td class="text-xs-right">{{ props.item.time }}</td>
            <td class="justify-center">
              <v-btn icon class="mx-0" @click="buyFromSellList(props.item)">
                {{ $t("message.buyCard") }}
                <v-icon dark right>check_circle</v-icon>
              </v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
    <check-tx v-model="checkTxDialog" :TXData="txData" />
    <current-order v-model="orderDialog" :OrderInfo="curOrder" />
  </v-container>
</template>

<script>
import axios from 'axios';
import { BigNumber } from 'bignumber.js';
import CheckTX from './CheckTX';
import CurrentOrder from './CurrentOrder';
import EventBus from '../event-bus';

export default {
  name: 'Exchange',
  watch: {
    // disable lint here because arrow function doesn't get this context
    /* eslint-disable */
    selectedToken: function(newVal, oldVal) {
      console.log('=> selection changed: ', newVal, ' | was: ', oldVal);
      if (newVal === '0') {
        this.getPrice();
        this.currentContract = this.$contracts[0];
      } else {
        this.getCMPrice();
        this.currentContract = this.$contracts[1];
      }
      this.getOrders();
    },
    curOrder: function(newVal, oldVal) {
      this.orderDialog = true;
    }
    /* eslint-enable */
  },
  components: {
    'check-tx': CheckTX,
    'current-order': CurrentOrder
  },
  data() {
    return {
      currentPrice: 0,
      sellNumbers: 1,
      buyNumbers: 1,
      selectedToken: '0',
      supportedTokens: [
        { text: 'NRT', value: '0' },
        { text: 'RMBnt', value: '1' }
      ],
      alert: true,
      buyOrders: [
        {
          playId: 'Player #411',
          playerAddr: 'n1b...',
          orderId: 0,
          amount: 100,
          price: 1.59,
          time: '6/20/2018, 9:05:00 PM',
          type: ''
        }
      ],
      sellOrders: [
        {
          playId: 'Play #511',
          playerAddr: 'n1b...',
          orderId: 0,
          amount: 200,
          price: 0.11,
          time: '6/18/2018, 5:00:00 PM',
          type: ''
        }
      ],
      checkTxDialog: false,
      txData: null,
      currentContract: this.$contracts[0],
      orderDialog: false,
      curOrder: null
    };
  },
  computed: {
    /* eslint-disable */
    totalNASBuy: function() {
      return this.currentPrice * this.buyNumbers;
    },
    totalNASSell: function() {
      return this.currentPrice * this.sellNumbers;
    }
    /* eslint-enable */
  },
  methods: {
    buyToken() {
      console.log(
        `Buy ${this.buyNumbers} tokens is called. ${this.e1} is selected`
      );
      const value = new BigNumber(this.totalNASBuy.toString());
      this.newOrder('1', value);
    },
    sellToken() {
      console.log(`Sell ${this.sellNumbers} tokens is called.`);
      this.newOrder('2', 0);
    },
    newOrder(type, value) {
      const callFunction = 'newOrder';
      let callArgs;
      const price = this.$Unit.nasToBasic(this.currentPrice);
      if (this.selectedToken === '0') {
        callArgs = JSON.stringify([type, price]);
      } else {
        let amount;
        if (type === '1') {
          amount = this.buyNumbers;
        } else {
          amount = this.sellNumbers;
        }
        callArgs = JSON.stringify([type, amount, price]);
      }
      this.$nebPay.call(this.currentContract, value, callFunction, callArgs, {
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
    },
    getPrice() {
      console.log('=> exchange getPrice');
      const call = {
        function: 'getCurrentPrice',
        args: '[]'
      };
      this.$neb.api
        .call(
          this.$account,
          this.currentContract,
          0,
          '0',
          this.$gasPrice,
          this.$gasLimit,
          call
        )
        .then((resp) => {
          console.log(`====> exchange getprice : ${JSON.stringify(resp)}`);
          if (resp.result.length === 0) {
            console.log('Exchange getBuyOrderIds result is empty');
          } else {
            const nasBase = 10 ** 18;
            const result = JSON.parse(resp.result) / nasBase;
            this.currentPrice = result;
          }
          if (
            resp.execute_err.length > 0 &&
            resp.execute_err !== 'insufficient balance'
          ) {
            throw new Error(resp.execute_err);
          }
        });
    },
    getCMPrice() {
      this.loading = true;
      axios
        .get('https://api.coinmarketcap.com/v2/ticker/1908/?convert=cny')
        .then(
          (resp) => {
            this.loading = false;
            const RMBNAS = resp.data.data.quotes.CNY.price;
            console.log(
              `=> axio return: ${JSON.stringify(
                resp.data.data.quotes.CNY.price
              )}`
            );
            this.currentPrice = 1 / RMBNAS;
          },
          (err) => {
            this.loading = false;
            throw new Error(err);
          }
        );
    },
    buyFromSellList(entry) {
      console.log(`==>buying: ${JSON.stringify(entry)}`);
      if (this.selectedToken === '0') {
        const callArgs = JSON.stringify([entry.orderId]);
        this.takeOrder(entry, callArgs);
      } else {
        this.curOrder = entry;
        if (this.curOrder) {
          this.orderDialog = true;
        }
      }
    },
    sellFromBuyList(entry) {
      console.log(`==>selling: ${JSON.stringify(entry)}`);
      if (this.selectedToken === '0') {
        const callArgs = JSON.stringify([entry.orderId]);
        this.takeOrder(entry, callArgs);
      } else {
        this.curOrder = entry;
        if (this.curOrder) {
          this.orderDialog = true;
        }
      }
    },
    takeOrder(orderInfo, _callArgs) {
      const callFunction = 'takeOrder';
      let callArgs;
      if (!_callArgs) {
        callArgs = JSON.stringify([orderInfo.orderId, orderInfo.amount]);
      } else {
        callArgs = _callArgs;
      }
      // if taking a buy order I'm selling NRC20 i.e. value = 0
      let value = 0;
      if (orderInfo.type === '1') {
        value = 0;
      } else {
        value = orderInfo.price * orderInfo.amount;
        value = new BigNumber(value.toString());
      }
      console.log(`=> value: ${value}`);
      this.$nebPay.call(this.currentContract, value, callFunction, callArgs, {
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
    },
    getOrdersDetail(_ids, _type) {
      let pArray = [];
      pArray = _ids.map((id) => {
        const call = {
          function: 'getOrderDetail',
          args: JSON.stringify([id])
        };
        return this.$neb.api.call(
          this.$account,
          this.currentContract,
          0,
          '0',
          this.$gasPrice,
          this.$gasLimit,
          call
        );
      });
      const promises = Promise.all(pArray);
      promises.then((results) => {
        console.log(`==>promiseall: ${JSON.stringify(results)}`);
        const buyList = [];
        const sellList = [];
        for (let i = 0; i < results.length; i += 1) {
          if (results[i].result.length > 0) {
            const tmp = JSON.parse(results[i].result);
            const entry = {};
            entry.playId = `${tmp.maker.substring(0, 3)}...${tmp.maker.substr(
              tmp.maker.length - 3
            )}`;
            entry.playerAddr = tmp.maker;
            entry.orderId = tmp.id;
            const base = 10 ** 18;
            entry.price = tmp.price / base;
            if (this.selectedToken === '0') {
              entry.amount = 1;
            } else {
              entry.amount = tmp.amount;
            }
            entry.time = new Date(tmp.timeStamp * 1000).toISOString();
            entry.type = tmp.type;
            if (tmp.type === '1') {
              buyList.push(entry);
            } else if (tmp.type === '2') {
              sellList.push(entry);
            } else {
              console.log('unexpected type');
            }
            if (_type === '1') this.buyOrders = buyList;
            if (_type === '2') this.sellOrders = sellList;
          } else {
            console.log('===> getOrdersDetail promises.then resultsis empty');
          }
        }
      });
    },
    getOrders() {
      // sell orders
      let call = {
        function: 'getSellOrderIds',
        args: '[]'
      };
      console.log(`====> exchange currentContract : ${this.currentContract}`);
      this.$neb.api
        .call(
          this.$account,
          this.currentContract,
          0,
          '0',
          this.$gasPrice,
          this.$gasLimit,
          call
        )
        .then((resp) => {
          console.log(
            `====> exchange getSellOrderIds : ${JSON.stringify(resp)}`
          );
          if (resp.result.length === 0) {
            console.log('Exchange getSellOrderIds result is empty');
          } else {
            const result = JSON.parse(resp.result);
            console.log(`=> sellOrderids: ${result}`);
            this.sellOrderIds = result;
            this.getOrdersDetail(result, '2');
          }
          if (
            resp.execute_err.length > 0 &&
            resp.execute_err !== 'insufficient balance'
          ) {
            throw new Error(resp.execute_err);
          }
        });
      // buy orders
      call = {
        function: 'getBuyOrderIds',
        args: '[]'
      };
      this.$neb.api
        .call(
          this.$account,
          this.currentContract,
          0,
          '0',
          this.$gasPrice,
          this.$gasLimit,
          call
        )
        .then((resp) => {
          console.log(
            `====> exchange getBuyOrderIds : ${JSON.stringify(resp)}`
          );
          if (resp.result.length === 0) {
            console.log('Exchange getBuyOrderIds result is empty');
          } else {
            const result = JSON.parse(resp.result);
            console.log(`=> buyOrderids: ${result}`);
            this.buyOrderIds = result;
            this.getOrdersDetail(result, '1');
          }
          if (
            resp.execute_err.length > 0 &&
            resp.execute_err !== 'insufficient balance'
          ) {
            throw new Error(resp.execute_err);
          }
        });
    }
  },
  beforeMount() {
    console.log('=> exchange beforeMOunt');
    this.getPrice();
    this.getOrders();
  },
  mounted() {
    EventBus.$on('confirmTake', (orderInfo) => {
      console.log(`=> event got confirmTake ${JSON.stringify(orderInfo)}`);
      this.takeOrder(orderInfo);
    });
  }
};
</script>
