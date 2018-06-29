import Vue from 'vue';

const Wallet = require('nebulas');
const HttpRequest = require('nebulas').HttpRequest;

const neb = new Wallet.Neb();
const contracts = [
  'n1tQxvdAC5QKVWzMr9gysaB4qhmsy6Y8Ekz', // NRT
  'n1fi9R7ba4PqY9EKu4jn8HFQHTaH3HciTwv' // RMBnt
];
// neb.setRequest(new HttpRequest('https://testnet.nebulas.io'));
neb.setRequest(new HttpRequest('https://mainnet.nebulas.io'));

function isChromeExtensionInstalled() {
  if (typeof webExtensionWallet === 'undefined') {
    // console.log('Chrome Extenion is not installed.');
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
        resolve(userAddr);
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
