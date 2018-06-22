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
        <v-subheader> {{ $t("message.buyCard") }} </v-subheader>
        <v-data-table :headers="buyHeaders" :items="buyOrders" hide-actions class="elevation-1">
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
        <v-subheader> {{ $t("message.sellCard") }} </v-subheader>
        <v-data-table :headers="sellHeaders" :items="sellOrders" hide-actions class="elevation-1">
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
  </v-container>
</template>

<script>
import axios from 'axios';
import CheckTX from './CheckTX';

export default {
  name: 'Exchange',
  watch: {
    // disable lint here because arrow function doesn't get this context
    /* eslint-disable */
    selectedToken: function(newVal, oldVal) {
      /* eslint-enable */
      console.log('=> selection changed: ', newVal, ' | was: ', oldVal);
      if (newVal === '0') {
        this.getPrice();
        this.currentContract = this.contractAddresses[0];
      } else {
        this.getCMPrice();
        this.currentContract = this.contractAddresses[1];
      }
      this.getOrders();
    }
  },
  components: {
    'check-tx': CheckTX
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
      buyHeaders: [
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
      ],
      buyOrders: [
        {
          playId: 'Player #411',
          amount: 100,
          price: 1.59,
          time: '6/20/2018, 9:05:00 PM'
        }
      ],
      sellHeaders: [
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
      ],
      sellOrders: [
        {
          playId: 'Play #511',
          amount: 200,
          price: 0.11,
          time: '6/18/2018, 5:00:00 PM'
        }
      ],
      checkTxDialog: false,
      txData: null,
      contractAddresses: [
        this.$contractAddr,
        'n1tjSqaY3zpUHtfLvcVsC3S5uTgCvD6skJR'
      ],
      currentContract: this.$contractAddr
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
    },
    sellToken() {
      console.log(`Sell ${this.sellNumbers} tokens is called.`);
      const callFunction = 'newOrder';
      let callArgs;
      const type = '2';
      const price = this.$Unit.nasToBasic(this.currentPrice);
      if (this.selectedToken === '0') {
        callArgs = JSON.stringify([type, price]);
      } else {
        const amount = this.sellNumbers;
        callArgs = JSON.stringify([type, amount, price]);
      }
      this.$nebPay.call(this.currentContract, 0, callFunction, callArgs, {
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
          this.currentPrice = result;
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
      console.log(JSON.stringify(entry));
    },
    sellFromBuyList(entry) {
      console.log(JSON.stringify(entry));
    },
    getSellOrders(_ids) {
      let pArray = [];
      pArray = _ids.map((id) => {
        const call = {
          function: 'getOrderDetail',
          args: JSON.stringify([id])
        };
        return this.$neb.api.call(
          this.$account.getAddressString(),
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
          const tmp = JSON.parse(results[i].result);
          const entry = {};
          entry.playId = `Player#${tmp.id}`;
          const base = 10 ** 18;
          entry.price = tmp.price / base;
          entry.amount = 10;
          entry.time = new Date(tmp.timeStamp * 1000).toISOString();
          if (tmp.type === '1') {
            buyList.push(entry);
          } else if (tmp.type === '2') {
            sellList.push(entry);
          } else {
            console.log('unexpected type');
          }
        }
        this.buyOrders = buyList;
        this.sellOrders = sellList;
      });
    },
    getOrders() {
      const call = {
        function: 'getSellOrderIds',
        args: '[]'
      };
      this.$neb.api
        .call(
          this.$account.getAddressString(),
          this.currentContract,
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
          const result = JSON.parse(resp.result);
          if (!result) {
            throw new Error('访问合约API出错');
          }
          console.log(`=> sellOrderids: ${result}`);
          this.sellOrderIds = result;
          this.getSellOrders(result);
        });
    }
  },
  beforeMount() {
    console.log('=> exchange beforeMOunt');
    this.getPrice();
    this.getOrders();
  }
};
</script>
