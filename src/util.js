function isChromeExtensionInstalled() {
  if (typeof (webExtensionWallet) === 'undefined') {
    console.log('Chrome Extenion is not installed.');
    return false;
  }

  return true;
}

function loadAccountAddress() {
  window.addEventListener('message', (e) => {
    if (e.data.data && !!e.data.data.account) {
      const addressWallet = e.data.data.account;
      console.log(`Current Wallet address is ${addressWallet}`);
    }
  });

  window.postMessage({
    target: 'contentscript',
    data: {},
    method: 'getAccount',
  }, '*');
}

export default {
  isChromeExtensionInstalled,
  loadAccountAddress
};
