import Vue from 'vue';
import Router from 'vue-router';
import About from '@/components/About';
import Buy from '@/components/Buy';
import Exchange from '@/components/Exchange';
import MyAccount from '@/components/MyAccount';

Vue.use(Router);
export default new Router({
  routes: [
    {
      path: '/',
      name: 'Exchange',
      component: Exchange
    },
    {
      path: '/buy',
      name: 'Buy',
      component: Buy
    },
    {
      path: '/myaccount',
      name: 'MyAccount',
      component: MyAccount
    },
    {
      path: '/about',
      name: 'About',
      component: About
    }
  ]
});
