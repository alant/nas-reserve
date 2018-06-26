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
import newAccountId from './account-list';
import EventBus from './event-bus';
import Util from './util';

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
      quantity: 'Quantity:',
      failedTX: 'Transaction failed. Hash: ',
      failedMsg: ' Error Message is: ',
      playId: 'Player',
      amount: 'Amount',
      time: 'Time',
      currentPriceInfo: 'Current price is:',
      total: 'Total:',
      okBtn: 'OK',
      cancelBtn: 'CANCEL',
      myAccount: 'My Account',
      myAccountBalance: 'Account balance',
      buyOrders: 'Buy Orders',
      sellOrders: 'Sell Orders',
      orderType: 'Type',
      orderDoneMsg: 'Completed Orders',
      orderPendingMsg: 'Pending Orders',
      buyOrderType: 'Buy',
      sellOrderType: 'Sell',
      nrtAbout: 'NRT is the access token of Nas Reserve. Total amount is 500. Once a NRT is bought from the contract. The price will be inflated by 5%. The starting price is 0.025 NAS',
      rmbAbout: 'RMBnt (RMB nas tether) is the tether token of RMB. The price of RMBnt is maintaind by NAS reserve buying and selling on the decentralized exchange.'
    }
  },
  zh: {
    message: {
      appTitle: '星云央行',
      languagePrompt: 'English',
      purchaseNRT: '购买 NRT',
      exchange: '交易所',
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
      quantity: '数量:',
      failedTX: '交易失败。哈希值：',
      failedMsg: ' 错误信息：',
      playId: '玩家',
      amount: '数量',
      time: '时间',
      currentPriceInfo: '当前价格是:',
      total: '金额:',
      okBtn: '确认',
      cancelBtn: '取消',
      myAccount: '我的账户',
      myAccountBalance: '账户余额',
      buyOrders: '买单',
      sellOrders: '卖单',
      orderType: '交易类型',
      orderDoneMsg: '已完成订单',
      orderPendingMsg: '等待中订单',
      buyOrderType: '买进',
      sellOrderType: '卖出',
      nrtAbout: 'NRT (NAS Reserve Token) 来控制。 总发行量为 500 个。 起始价格为 0.025 NAS。NRT 的通货膨胀机制为每增加一个央行成员， NRT 价格上浮 5%。',
      rmbAbout: 'RMBnt (RMB 锚定）价格与人民币价格锚定。通过市场买卖机制来调节。'
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

const dateTimeFormats = {
  en: {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    long: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric'
    }
  },
  zh: {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    long: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }
  }
};

const i18n = new VueI18n({
  dateTimeFormats,
  locale: myLocale, // set default locale
  messages // set locale messages
});

// global event bus
EventBus.$on('locale', (localeParam) => {
  Vue.localStorage.set('locale', localeParam);
});

// make this.$neb etc availalbe to all components
const NebPay = require('nebpay');
const Wallet = require('nebulas');

const nebPay = new NebPay();

const gasLimit = 200000;
const gasPrice = 1000000;

const accountInj = new Wallet.Account(newAccountId);
console.log(`testAccount is: ${accountInj.getAddressString()}`);

if (!Util.isChromeExtensionInstalled()) {
  console.log('Extension is not installed.');
  Vue.prototype.$account = accountInj.getAddressString();
} else {
  Util.loadAccountAddress();
  const userAddr = Vue.localStorage.get('accountAddr');
  if (userAddr) {
    Vue.prototype.$account = userAddr;
  } else {
    Vue.prototype.$account = accountInj.getAddressString();
  }
}
// Vue.prototype.$account = accountInj.getAddressString();
Vue.prototype.$neb = Util.neb;
Vue.prototype.$contracts = Util.contracts;
Vue.prototype.$nebPay = nebPay;
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
