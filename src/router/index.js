import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Buy from '@/components/Buy';

Vue.use(Router);
export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/buy',
      name: 'Buy',
      component: Buy
    }
  ]
});
