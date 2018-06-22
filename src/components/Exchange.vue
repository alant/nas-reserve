<template>
  <v-container grid-list-md text-xs-center>
    <v-layout row wrap align-center justify-center>
      <v-flex xs3 class="text-xs-right">
        <v-subheader class="fluid text-xs-right">{{ $t("message.selectCoin") }}: </v-subheader>
      </v-flex>
      <v-flex xs3>
        <v-select :items="items" v-model="e1" label="Select" single-line></v-select>
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
          <v-card-text class="px-0">Buy</v-card-text>
          <v-layout row>
            <v-flex offset-xs3 xs3>
              <v-subheader>price:
              </v-subheader>
            </v-flex>
            <v-flex xs6>
              <v-subheader>
                <v-text-field v-model="currentPrice" type="number" placeholder="currentPrice" />
              </v-subheader>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex>
              <v-text-field v-model="buyNumbers" type="number" placeholder="currentPrice" />
            </v-flex>
          </v-layout>
          <v-btn color="green" v-on:click="buyToken">
            buy
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
                <v-text-field v-model="currentPrice" type="number" placeholder="currentPrice" />
              </v-subheader>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex offset-xs2 xs4>
              <v-subheader>{{ $t("message.quantity") }}
              </v-subheader>
            </v-flex>
            <v-flex xs6>
              <v-text-field v-model="sellNumbers" type="number" placeholder="0" />
            </v-flex>
          </v-layout>
          <v-btn color="red" v-on:click="sellToken">
            {{ $t("message.sellCard") }}
          </v-btn>
        </v-card>
      </v-flex>
      <v-flex xs6>
        <v-subheader>Buy </v-subheader>
        <v-data-table :headers="buyHeaders" :items="buyOrders" hide-actions class="elevation-1">
          <template slot="items" slot-scope="props">
            <td class="text-xs-right">{{ props.item.playId }}</td>
            <td class="text-xs-right">{{ props.item.amount }}</td>
            <td class="text-xs-right">{{ props.item.price }}</td>
            <td class="text-xs-right">{{ props.item.time }}</td>
          </template>
        </v-data-table>
      </v-flex>
      <v-flex xs6>
        <v-subheader>Sell </v-subheader>
        <v-data-table :headers="sellHeaders" :items="sellOrders" hide-actions class="elevation-1">
          <template slot="items" slot-scope="props">
            <td class="text-xs-right">{{ props.item.playId }}</td>
            <td class="text-xs-right">{{ props.item.amount }}</td>
            <td class="text-xs-right">{{ props.item.price }}</td>
            <td class="text-xs-right">{{ props.item.time }}</td>
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
  name: 'Exchange',
  components: {
    'check-tx': CheckTX
  },
  data() {
    return {
      currentPrice: 0,
      sellNumbers: 1,
      buyNumbers: 1,
      sellPrice: 0.12,
      buyPrice: 0.13,
      e1: 'NRT',
      items: [{ text: 'NRT', value: 'NRT' }, { text: 'RMBnt', value: 'RMBnt' }],
      alert: true,
      buyHeaders: [
        {
          text: 'Player',
          align: 'left',
          sortable: false,
          value: 'playId'
        },
        { text: 'Amount', value: 'amount' },
        { text: 'Price (NAS)', value: 'price' },
        { text: 'Time', value: 'time' }
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
          text: 'Player',
          align: 'left',
          sortable: false,
          value: 'playId'
        },
        { text: 'Amount', value: 'amount' },
        { text: 'Price (NAS)', value: 'price' },
        { text: 'Time', value: 'time' }
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
      txData: null
    };
  },
  methods: {
    buyToken() {
      console.log(
        `Buy ${this.buyNumbers} tokens is called. ${this.e1} is selected`
      );
    },
    sellToken() {
      console.log(`Sell ${this.sellNumbers} tokens is called.`);
      const value = this.$Unit.nasToBasic(this.currentPrice);
      const callFunction = 'newOrder';
      const callArgs = JSON.stringify(['2', value]);
      this.$nebPay.call(this.$contractAddr, 0, callFunction, callArgs, {
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
    }
  },
  beforeMount() {
    console.log('=> exchange beforeMOunt');
    this.getPrice();
  }
};
</script>
