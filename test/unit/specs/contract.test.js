/* eslint-disable */

var HttpRequest = require("nebulas").HttpRequest;
var Wallet = require("nebulas");
var FS = require("fs");
var BigNumber = require("bignumber.js");
var path = require("path");

var Transaction = Wallet.Transaction;
var Unit = Wallet.Unit;

var globalConfig = {
  //change to true when changing contract
  redploy: false,
  env: "testnet",
  configFile: path.join(__dirname, "test_config.json"),
  maxCheckTime: 10
};

var contractFile = "/../contract/NRT.js";

//has about 9nas test token however, not able to import to webwallet. Abandon for now
// var testAccount = new Wallet.Account(
//   "a4a678f09c08affa569933252425da52d3df2082c87ed8c7b5f4b3788207350e"
// );
//nas test1 n1bZ6riZspfRmBLrURfHHb34mxHJKtdeepX
var testAccount1 = new Wallet.Account(
  "97eb9720c1ff26a154f7dd2040bcbda5e005ce4f1675296bfa1f36c9451c0b96"
);
//nas test2 n1TT1VCv7RGPzdgjby9B7Lh2bZPX1PoVetD
var testAccount2 = new Wallet.Account(
  "2b779296ab0ee991a73ecc61319afff8352d171b0a8778ef623911f65d7bf5b4"
);

var contractType = "js";

var contractAddr;
var contractTxhash;

var ChainID;
var neb = new Wallet.Neb();

if (globalConfig.env === "testnet") {
  console.log("=== testnet config ===");
  ChainID = 1001;
  neb.setRequest(new HttpRequest("https://testnet.nebulas.io"));
}

function deployContract(_from, testInput) {
  console.log("==> deployContract");
  var fromState;
  return new Promise(resolve => {
    neb.api
      .getAccountState(_from.getAddressString())
      .then(function(state) {
        fromState = state;
        console.log("from state: " + JSON.stringify(fromState));
      })
      .then(function() {
        var filePath = __dirname + contractFile;
        console.log("deploying contract: " + filePath);
        var contractSource = FS.readFileSync(filePath, "utf-8");
        var contract = {
          source: contractSource,
          sourceType: contractType,
          args: ""
        };
        // console.log("debug: " + contractSource);
        console.log("=== gas limit: " + testInput.gasLimit);
        var tx = new Transaction(
          ChainID,
          _from,
          _from,
          0,
          parseInt(fromState.nonce) + 1,
          1000000,
          testInput.gasLimit,
          contract
        );
        tx.signTransaction();
        var rawTx = tx.toProtoString();
        neb.api
          .sendRawTransaction({
            data: rawTx
          })
          .then(async function(resp) {
            console.log("transacition result: " + JSON.stringify(resp));
            console.log(
              "contract address: " + JSON.stringify(resp.contract_address)
            );
            contractAddr = resp.contract_address;
            contractTxhash = resp.txhash;
            var fs = require("fs");
            var file = require(globalConfig.configFile);

            file.contract_address = contractAddr;
            file.txhash = contractTxhash;
            fs.writeFileSync(
              globalConfig.configFile,
              JSON.stringify(file, null, 2)
            );

            await tryCheckTx(10, contractTxhash);
            resolve();
          });
      })
      .catch(function(err) {
        console.log(err);
      });
  });
}

function readSavedContractAddr() {
  var fs = require("fs");
  var content = fs.readFileSync(globalConfig.configFile);
  try {
    var data = JSON.parse(content);
    contractAddr = data.contract_address;
    contractTxhash = data.txhash;
  } catch (e) {
    console.log("malformed request", content);
  }
}

function checkTransaction(seq, hash) {
  return new Promise((resolve, reject) => {
    console.log("==>checkTransaction #: " + seq);
    neb.api
      .getTransactionReceipt(hash)
      .then(function(resp) {
        // console.log("tx receipt: " + JSON.stringify(resp));
        if (resp.status === 2) {
          console.log("transaction not yet confirmed: status = 2 ");
          resolve(false);
        } else if (resp.status === 0) {
          console.log(
            "transaction failed! status = 2 error: " + JSON.stringify(resp)
          );
          reject(false);
        } else {
          // console.log("transaction succeeded: " + JSON.stringify(resp));
          console.log("transaction succeeded: ");
          resolve(true);
        }
      })
      .catch(function(err) {
        console.log("getTransactionReceipt error: " + err);
        reject(false);
      });
  });
}
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function tryCheckTx(maxTry, hash) {
  return new Promise(async resolve => {
    for (var i = 0; i < maxTry; i++) {
      var result = await checkTransaction(i + 1, hash);
      if (result) {
        resolve();
        break;
      }
      await timeout(3000);
    }
  });
}
async function callContract(_from, testInput) {
  await neb.api.getAccountState(_from.getAddressString()).then(function(state) {
    var accountBalance = new BigNumber(state.balance);
    if (accountBalance.lt(new BigNumber(10 ** 17))) {
      throw new Error("not enough test nas!");
    }
  });

  var call = {
    function: testInput.func,
    args: testInput.args
  };

  return new Promise((resolve, reject) => {
    neb.api.getAccountState(contractAddr).then(function(state) {
      // console.log("from state: " + JSON.stringify(state));
      neb.api
        .call(
          _from.getAddressString(),
          contractAddr,
          testInput.value,
          parseInt(state.nonce) + 1,
          testInput.gasPrice,
          testInput.gasLimit,
          call
        )
        .then(async function(resp) {
          console.log("====> : contractCall returned" + JSON.stringify(resp));
          // checkTransaction(resp.txhash);
          resolve(resp);
        })
        .catch(function(err) {
          console.log("tx to contract failed: " + JSON.stringify(err));
          reject(err);
        });
    });
  });
}

function sendTxToContract(_from, testInput) {
  var call = {
    function: testInput.func,
    args: testInput.args
  };

  return new Promise((resolve, reject) => {
    neb.api
      .getAccountState(_from.getAddressString())
      .then(function(state) {
        var accountBalance = new BigNumber(state.balance);
        if (accountBalance.lt(new BigNumber(10 ** 17))) {
          throw new Error("not enough test nas!");
        }
        console.log("test account state:" + JSON.stringify(state));
        console.log("sendtx to contract: " + contractAddr);
        var _value = Unit.nasToBasic(testInput.value);
        console.log(
          "sendtx to contract, value: " + _value + " type: " + typeof _value
        );
        var _nonce = parseInt(state.nonce) + 1;
        var tx = new Transaction(
          ChainID,
          _from,
          contractAddr,
          _value,
          _nonce,
          testInput.gasPrice,
          testInput.gasLimit,
          call
        );
        tx.signTransaction();
        return neb.api.sendRawTransaction(tx.toProtoString());
      })
      .then(async function(resp) {
        console.log("send tx to contract result:" + JSON.stringify(resp));
        await tryCheckTx(10, resp.txhash);
        resolve();
      })
      .catch(function(err) {
        console.log("tx to contract failed: " + JSON.stringify(err));
        reject(err);
      });
  });
}

beforeAll(async () => {
  jest.setTimeout(45000);
  if (globalConfig.redploy) {
    var testInput = {
      contractType: contractType,
      gasLimit: 200000,
      gasPrice: 1000000
    };
    await deployContract(testAccount1, testInput);
  } else {
    readSavedContractAddr();
    await tryCheckTx(10, contractTxhash);
  }
});

test("testing getOrderSeq", async () => {
  jest.setTimeout(15000);
  var testInput = {
    gasLimit: 200000,
    gasPrice: 1000000,
    func: "getOrderSeq",
    args: "[]",
    value: 0
  };
  const contractReturn = await callContract(testAccount1, testInput);
  const result = parseInt(JSON.parse(contractReturn.result));
  expect(result).toBe(0);
});

test("testing blanceOf", async () => {
  jest.setTimeout(15000);
  var testInput = {
    gasLimit: 200000,
    gasPrice: 1000000,
    func: "balanceOf",
    args: JSON.stringify([testAccount1.getAddressString()]),
    value: 0
  };
  const contractReturn = await callContract(testAccount1, testInput);
  const result = parseInt(JSON.parse(contractReturn.result));
  expect(result).toBe(500);
});

test("testing currentPrice", async () => {
  jest.setTimeout(15000);
  var testInput = {
    gasLimit: 200000,
    gasPrice: 1000000,
    func: "getCurrentPrice",
    args: "[]",
    value: 0
  };
  const contractReturn = await callContract(testAccount1, testInput);
  const result = parseInt(JSON.parse(contractReturn.result));
  // inflation rate is 1.05, raise ** 0 as you go. e.g. 1.05 ** 1 when testing the 2nd time with the same contract etc.
  expect(result).toBe(1.05 ** 0 * 0.025 * 10 ** 18);
});
test("testing getSellOrderIds", async () => {
  jest.setTimeout(15000);
  var testInput = {
    gasLimit: 200000,
    gasPrice: 1000000,
    func: "getSellOrderIds",
    args: JSON.stringify([testAccount1.getAddressString()]),
    value: 0
  };
  const contractReturn = await callContract(testAccount1, testInput);
  console.log(contractReturn);
});

test("testing buyOneShare", async () => {
  jest.setTimeout(30000);
  var testInput = {
    gasLimit: 200000,
    gasPrice: 1000000,
    func: "buyOneShare",
    args: "[]",
    value: 0.025
  };
  await sendTxToContract(testAccount2, testInput);
  var testInput2 = {
    gasLimit: 200000,
    gasPrice: 1000000,
    func: "balanceOf",
    args: JSON.stringify([testAccount2.getAddressString()]),
    value: 0
  };
  const contractReturn = await callContract(testAccount2, testInput2);
  const result = parseInt(JSON.parse(contractReturn.result));
  console.log("after buyOneShare: " + result);
  expect(result).toBe(1);
});

test("testing newOrder", async () => {
  jest.setTimeout(30000);
  var testInput = {
    gasLimit: 200000,
    gasPrice: 1000000,
    func: "newOrder",
    args: JSON.stringify(["sell", 1]),
    value: 0.025
  };
  await sendTxToContract(testAccount2, testInput);
  var testInput2 = {
    gasLimit: 200000,
    gasPrice: 1000000,
    func: "getSellOrderIds",
    args: "[]",
    value: 0
  };
  const contractReturn = await callContract(testAccount2, testInput2);
  console.log("=> after sell order: " + contractReturn)
});


// test("testing buy", async () => {
//   jest.setTimeout(30000);
//   var testInput = {
//     gasLimit: 200000,
//     gasPrice: 1000000,
//     func: "buyOneShare",
//     args: JSON.stringify(["0"]),
//     value: 0.025
//   };
//   await sendTxToContract(testAccount2, testInput);
//   var testInput2 = {
//     gasLimit: 200000,
//     gasPrice: 1000000,
//     func: "balanceOf",
//     args: JSON.stringify([testAccount2.getAddressString()]),
//     value: 0
//   };
//   const contractReturn = await callContract(testAccount2, testInput2);
//   const result = parseInt(JSON.parse(contractReturn.result));
//   console.log("after buyOneShare: " + result);
//   expect(result).toBe(1);
// });

// test("testing currentPrice", async () => {
//   jest.setTimeout(15000);
//   var testInput = {
//     gasLimit: 200000,
//     gasPrice: 1000000,
//     func: "getCurrentPrice",
//     args:  "[]",
//     value: 0
//   };
//   const contractReturn = await callContract(testAccount1, testInput);
//   const result = parseInt(JSON.parse(contractReturn.result));
//   // inflation rate is 1.05, raise ** 0 as you go. e.g. 1.05 ** 1 when testing the 2nd time with the same contract etc.
//   expect(result).toBe((1.05 ** 2) * 0.025 * 10 ** 18);
// });

// test("testing getAllShareHolders", async () => {
//   jest.setTimeout(15000);
//   var testInput = {
//     gasLimit: 200000,
//     gasPrice: 1000000,
//     func: "getAllShareHolders",
//     args: JSON.stringify([testAccount1.getAddressString()]),
//     value: 0
//   };
//   const contractReturn = await callContract(testAccount1, testInput);
//   console.log(contractReturn);
// });
