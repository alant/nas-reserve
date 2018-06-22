// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import VueI18n from 'vue-i18n';
import VueLocalStorage from 'vue-localstorage';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import App from './App';
import router from './router';
import EventBus from './event-bus';

Vue.use(Vuetify, {});
Vue.use(VueI18n);

Vue.config.productionTip = false;

const messages = {
  en: {
    message: {
      appTitle: 'NAS Reserve',
      languagePrompt: '中文',
      purchaseNRT: 'Purchase NRT Token',
      exchange: 'Exchange',
      about: 'About',
      buyBtn: 'Buy Now',
      selectCoin: 'Select the coin to trade',
      nasrdesc: `NAS reserve is a reserve bank run by its constituents.
                There are 500 membership avaiable. `,
      pricenow: 'The price of a NRT right now is',
      confirming: 'Confirm Transaction',
      confirmingText: 'Checking transaction hash on blockchain...',
      successTx: 'Transaction confirmed. Hash: ',
      buyCard: 'Buy',
      sellCard: 'Sell',
      price: 'Price',
      quantity: 'Quantity',
      failedTX: 'Transaction failed. Hash: ',
      failedMsg: ' Error Message is: ',
      playId: 'Player',
      amount: 'Amount',
      time: 'time'
    }
  },
  zh: {
    message: {
      appTitle: '星云央行',
      languagePrompt: 'English',
      purchaseNRT: '购买 NRT',
      exchange: '交易',
      about: '关于',
      buyBtn: '购买 NRT',
      selectCoin: '选择交易的币种',
      nasrdesc: `星云央行是一个由央行成员运作的央行。 负责发行稳定币。
                成员的有效性由 NRT (NAS Reserve Token) 来控制。 总发行量为 500 个。 起始价格为 0.025 NAS。<br>
                NRT 的通货膨胀机制为每增加一个央行成员， NRT 价格上浮 5%。
                NRT 持有者将共同制定央行发币和回购的数额等运营策略。并获得交易所利润的回馈。`,
      pricenow: '当前 NRT 的价格为',
      confirming: '交易确认',
      confirmingText: '正在查询交易打包状态...',
      successTX: '交易已成功打包。哈希值：',
      buyCard: '买进',
      sellCard: '卖出',
      price: '价格',
      quantity: '数量',
      failedTX: '交易失败。哈希值：',
      failedMsg: ' 错误信息：',
      playId: '玩家',
      amount: '数量',
      time: '时间'
    }
  }
};

Vue.use(VueLocalStorage);
let myLocale = Vue.localStorage.get('locale');
if (!myLocale) {
  myLocale = navigator.language.substring(0, 2);
  if (myLocale !== 'en' && myLocale !== 'zh') {
    myLocale = 'en';
  }
}

const i18n = new VueI18n({
  locale: myLocale, // set default locale
  messages // set locale messages
});

// global event bus
EventBus.$on('locale', (localeParam) => {
  Vue.localStorage.set('locale', localeParam);
});

// make this.$neb etc availalbe to all components
const HttpRequest = require('nebulas').HttpRequest;
const Wallet = require('nebulas');
const NebPay = require('nebpay');

const testAccount1 = new Wallet.Account(
  '2b779296ab0ee991a73ecc61319afff8352d171b0a8778ef623911f65d7bf5b4'
);

const neb = new Wallet.Neb();
const nebPay = new NebPay();
neb.setRequest(new HttpRequest('https://testnet.nebulas.io'));
const toAddress = 'n1nYjjeKmbV1vMdquzPVrP3rR5EuJkaJ8pF';

const gasLimit = 200000;
const gasPrice = 1000000;

Vue.prototype.$neb = neb;
Vue.prototype.$nebPay = nebPay;
Vue.prototype.$contractAddr = toAddress;
Vue.prototype.$account = testAccount1;
Vue.prototype.$gasLimit = gasLimit;
Vue.prototype.$gasPrice = gasPrice;
Vue.prototype.$Unit = Wallet.Unit;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  i18n
});
