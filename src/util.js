function isChromeExtensionInstalled() {
  if (typeof (webExtensionWallet) === 'undefined') {
    console.log('Chrome Extenion is not installed.');
    return false;
  }

  return true;
}

export default {
  isChromeExtensionInstalled
};
