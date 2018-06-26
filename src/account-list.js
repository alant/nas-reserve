import AccountList from './accounts';

const index = Math.floor(Math.random() * AccountList.length);
const newAccountId = AccountList[index];

// console.log(`newAccount is is ${newAccountId}`);
// Use the test account for now since random account will encounter call api error.
// newAccountId = '2b779296ab0ee991a73ecc61319afff8352d171b0a8778ef623911f65d7bf5b4';

const exportAccount = newAccountId;

export default exportAccount;
