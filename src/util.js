import Vue from 'vue';

const Wallet = require('nebulas');
const HttpRequest = require('nebulas').HttpRequest;

const neb = new Wallet.Neb();
const contracts = [
  'n22UcnC8JXmUXDRTu2ow6LojMmmMstLo6AG', // NRT
  'n1tmW6xaDSQUMkJYFovreLLCkNj8CP49yn9' // RMBnt
];
neb.setRequest(new HttpRequest('https://testnet.nebulas.io'));

function isChromeExtensionInstalled() {
  if (typeof webExtensionWallet === 'undefined') {
    console.log('Chrome Extenion is not installed.');
    return false;
  }

  return true;
}

let userAccountAddr;
function loadAccountAddress() {
  window.postMessage(
    {
      target: 'contentscript',
      data: {},
      method: 'getAccount'
    },
    '*'
  );

  return new Promise((resolve) => {
    window.addEventListener('message', (e) => {
      if (e.data.data && !!e.data.data.account) {
        userAccountAddr = e.data.data.account;
        // console.log(
        //   `Current Wallet address is ${userAccountAddr} type: ${typeof userAccountAddr}`
        // );
        const userAddr = Vue.localStorage.get('accountAddr');
        if (userAddr !== userAccountAddr) {
          Vue.localStorage.set('accountAddr', userAccountAddr);
        }
        resolve();
      }
    });
  });
}

export default {
  isChromeExtensionInstalled,
  loadAccountAddress,
  userAccountAddr,
  contracts,
  neb
};
