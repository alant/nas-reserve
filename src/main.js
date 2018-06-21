// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import VueI18n from 'vue-i18n';
import VueLocalStorage from 'vue-localstorage';
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
      buyBtn: 'Buy'
    }
  },
  zh: {
    message: {
      appTitle: '星云央行',
      languagePrompt: 'English',
      purchaseNRT: '购买 NRT',
      exchange: '交易',
      about: '关于',
      buyBtn: '购买'
    }
  }
};

Vue.use(VueLocalStorage);
let myLocale = Vue.localStorage.get('locale');
if (!myLocale) {
  console.log(`==> no local storage : ${myLocale}`);
  myLocale = navigator.language.substring(0, 2);
}

console.log(`==> lang: ${myLocale}`);

const i18n = new VueI18n({
  locale: myLocale, // set default locale
  messages // set locale messages
});

EventBus.$on('locale', (localeParam) => {
  Vue.localStorage.set('locale', localeParam);
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  i18n
});
