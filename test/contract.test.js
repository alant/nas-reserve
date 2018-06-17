var HttpRequest = require("nebulas").HttpRequest;
var Wallet = require("nebulas");
var FS = require("fs");
var BigNumber = require("bignumber.js");
var path = require("path");

var Account = Wallet.Account;
var Transaction = Wallet.Transaction;

var testAccount = new Wallet.Account(
  new Buffer(
    "a4a678f09c08affa569933252425da52d3df2082c87ed8c7b5f4b3788207350e",
    "hex"
  )
);
var contractType = "js";
var contractFile = "/../contract/NRT.js";
var globalConfig = {
  env: "testnet",
  redploy: false,
  configFile: path.join(__dirname, "test_config.json"),
  maxCheckTime: 10
};
var contractAddr;
var contractTxhash;

var ChainID;
var sourceAccount;
var coinbase;
var from;
var neb = new Wallet.Neb();

if (globalConfig.env === "testnet") {
  console.log("=== testnet config ===");
  ChainID = 1001;
  neb.setRequest(new HttpRequest("https://testnet.nebulas.io"));
  sourceAccount = new Wallet.Account(
    "43181d58178263837a9a6b08f06379a348a5b362bfab3631ac78d2ac771c5df3"
  );
  coinbase = "n1QZMXSZtW7BUerroSms4axNfyBGyFGkrh5";
}

function getTestAccount() {
  console.log("==> getAccount");
  from = testAccount;
  console.log("addr:" + from.getAddressString());

  neb.api
    .getAccountState(from.getAddressString())
    .then(function(state) {
      state = state.result || state;
      console.log("balance" + state.balance);
      console.log("nonce" + state.nonce);
    })
    .catch(function(err) {
      console.log("err:", err);
    });
}

function deployContract(testInput) {
  console.log("==> deployContract");
  var fromState;
  return new Promise(resolve => {
    neb.api
      .getAccountState(from.getAddressString())
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
          from,
          from,
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
          .then(function(resp) {
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
            resolve();
          });
      })
      .catch(function(err) {
        console.log(err.error);
      });
  });
}

function readSavedContractAddr() {
  var fs = require("fs");
  var content = fs.readFileSync(globalConfig.configFile);
  var data = JSON.parse(content);
  contractAddr = data.contract_address;
  contractTxhash = data.txhash;
}

var checkTimes = 0;
function checkTransaction(hash) {
  return new Promise((resolve, reject) => {
    console.log("==>checkTransaction");
    if (checkTimes === 0) {
      beginCheckTime = new Date().getTime();
    }
    checkTimes += 1;
    console.log("jcjc ", checkTimes);
    if (checkTimes > globalConfig.maxCheckTime) {
      console.log("check tx receipt timeout: " + hash);
      checkTimes = 0;
      reject();
    }

    neb.api
      .getTransactionReceipt(hash)
      .then(function(resp) {
        // console.log("tx receipt: " + JSON.stringify(resp));
        if (resp.status === 2) {
          setTimeout(function() {
            checkTransaction(hash);
          }, 5000);
        } else if (resp.status === 0) {
          console.log("contract deploy failed! error: " + resp.excute_error);
          reject(resp);
        } else {
          checkTimes = 0;
          var endCheckTime = new Date().getTime();
          console.log(
            "check tx time: : " + (endCheckTime - beginCheckTime) / 1000
          );
          resolve(resp);
        }
      })
      .catch(function(err) {
        console.log(
          "fail to get tx receipt hash: '" +
            hash +
            "' probably being packing, continue checking..."
        );
        console.log(err);
        console.log(err.error);
        setTimeout(function() {
          checkTransaction(hash);
        }, 5000);
      });
  });
}


function callContract(testInput) {
  console.log("==> test balanceOf");

  var call = {
    function: testInput.func,
    args: testInput.args
  };

  return new Promise(resolve => {
    neb.api
      .getAccountState(contractAddr)
      .then(function(state) {
        // console.log("contract state: " + JSON.stringify(state));
        contractBalanceBefore = new BigNumber(state.balance);
        return neb.api.getAccountState(from.getAddressString());
      })
      .then(function(state) {
        // console.log("from state: " + JSON.stringify(state));

        neb.api
          .call(
            from.getAddressString(),
            contractAddr,
            testInput.value,
            parseInt(state.nonce) + 1,
            testInput.gasPrice,
            testInput.gasLimit,
            call
          )
          .then(function(resp) {
            console.log(
              "====> : sendRawTransaction returned" + JSON.stringify(resp)
            );
            checkTransaction(resp.txhash);
            resolve(parseInt(JSON.parse(resp.result)));
          });
      });
  });
}

beforeEach(async () => {
  getTestAccount();

  if (globalConfig.redploy) {
    var testInput = {
      contractType: contractType,
      gasLimit: 200000,
      gasPrice: 1000000
    };
    await deployContract(testInput);
  } else {
    readSavedContractAddr();
    await checkTransaction(contractTxhash);
  }
});

test("testing totalsupply", async () => {
  jest.setTimeout(15000);
  var testInput = {
    gasLimit: 200000,
    gasPrice: 1000000,
    func: "totalSupply",
    args: "[]",
    value: 0
  };
  const totalSupply = await callContract(testInput);
  expect(parseInt(totalSupply)).toBe(500);
});


test("testing blanceOf", async () => {
  jest.setTimeout(15000);
  var testInput = {
    gasLimit: 200000,
    gasPrice: 1000000,
    func: "balanceOf",
    args: JSON.stringify([from.getAddressString()]),
    value: 0
  };
  const balance = await callContract(testInput);
  expect(balance).toBe(500);
});