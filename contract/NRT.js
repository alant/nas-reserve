'use strict';

/* eslint-disable */

var GlobalConfig = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.chairman = obj.chairman;
    this.inflation_rate = obj.inflation_rate;
    this.initial_price = obj.initial_price;
    this.current_price = obj.current_price;
    this.balance = obj.balance;
    this.orderSeq = obj.orderSeq;
    this.commission = obj.commission;
  } else {
    this.chairman = '';
    this.inflation_rate = new BigNumber(1.05);
    this.initial_price = new BigNumber(0.025 * 10 ** 18);
    this.current_price = new BigNumber(0.025 * 10 ** 18);
    this.balance = new BigNumber(0);
    this.orderSeq = 0;
    this.commission = 0.01;
  }
};

GlobalConfig.prototype = {
  toString: function() {
    return JSON.stringify(this);
  }
};

var ShareHolder = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.name = obj.name;
    this.contact = obj.contact;
  } else {
    this.name = '';
    this.contact = '';
  }
};

ShareHolder.prototype = {
  toString: function() {
    return JSON.stringify(this);
  }
};

var Order = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.id = obj.id;
    this.type = obj.type; //  1 is buy; 2 is sell
    this.price = obj.price;
    this.balance = obj.balance;
    this.maker = obj.maker;
    this.taker = obj.taker;
    this.status = obj.status; // 0 is live, 1 is done, 2 is canceled
    this.timeStamp = obj.timeStamp;
  } else {
    this.id = '';
    this.type = '';
    this.price = new BigNumber(0);
    this.balance = new BigNumber(0);
    this.maker = '';
    this.taker = '';
    this.status = '';
    this.timeStamp = 0;
  }
};

Order.prototype = {
  toString: function() {
    return JSON.stringify(this);
  }
};

var Allowed = function(obj) {
  this.allowed = {};
  this.parse(obj);
};

Allowed.prototype = {
  toString: function() {
    return JSON.stringify(this.allowed);
  },

  parse: function(obj) {
    if (typeof obj != 'undefined') {
      var data = JSON.parse(obj);
      for (var key in data) {
        this.allowed[key] = new BigNumber(data[key]);
      }
    }
  },

  get: function(key) {
    return this.allowed[key];
  },

  set: function(key, value) {
    this.allowed[key] = new BigNumber(value);
  }
};

var NRTContract = function() {
  LocalContractStorage.defineProperties(this, {
    _name: null,
    _symbol: null,
    _decimals: null,
    _totalSupply: {
      parse: function(value) {
        return new BigNumber(value);
      },
      stringify: function(o) {
        return o.toString(10);
      }
    },
    _profit: {
      parse: function(value) {
        return new BigNumber(value);
      },
      stringify: function(o) {
        return o.toString(10);
      }
    },
    _config: {
      parse: function(text) {
        return new GlobalConfig(text);
      },
      stringify: function(o) {
        return o.toString();
      }
    },
    _allShareHolders: {
      parse: function(value) {
        return JSON.parse(value);
      },
      stringify: function(o) {
        return JSON.stringify(o);
      }
    },
    _buyOrderIds: {
      parse: function(value) {
        return JSON.parse(value);
      },
      stringify: function(o) {
        return JSON.stringify(o);
      }
    },
    _sellOrderIds: {
      parse: function(value) {
        return JSON.parse(value);
      },
      stringify: function(o) {
        return JSON.stringify(o);
      }
    }
  });

  LocalContractStorage.defineMapProperties(this, {
    balances: {
      parse: function(value) {
        return new BigNumber(value);
      },
      stringify: function(o) {
        return o.toString(10);
      }
    },
    allowed: {
      parse: function(value) {
        return new Allowed(value);
      },
      stringify: function(o) {
        return o.toString();
      }
    },
    shareHoldersDetail: {
      parse: function(value) {
        return new ShareHolder(value);
      },
      stringify: function(o) {
        return o.toString();
      }
    },
    orders: {
      parse: function(value) {
        return new Order(value);
      },
      stringify: function(o) {
        return o.toString();
      }
    },
    myOrders: {
      parse: function(value) {
        return JSON.parse(value);
      },
      stringify: function(o) {
        return o.toString();
      }
    }
  });
};

NRTContract.prototype = {
  init: function() {
    var from = Blockchain.transaction.from;

    this._name = 'Nas Reserve Token';
    this._symbol = 'NRT';
    this._decimals = 0;
    this._totalSupply = new BigNumber(500);
    this._profit = new BigNumber(0);
    var allShareHolders = [];
    allShareHolders.push(from);
    this._allShareHolders = allShareHolders;
    var buyOrderIds = [];
    this._buyOrderIds = buyOrderIds;
    var sellOrderIds = [];
    this._sellOrderIds = sellOrderIds;

    this.balances.set(from, this._totalSupply);
    this.transferEvent(true, from, from, this._totalSupply);

    var config = new GlobalConfig(null);
    config.chairman = from;
    this._config = config;
  },

  buyOneShare: function() {
    var _value = new BigNumber(Blockchain.transaction.value);
    var from = Blockchain.transaction.from;
    var allShareHolders = this._allShareHolders;

    var shareHolderCount = new BigNumber(allShareHolders.length);
    if (shareHolderCount.gt(this._totalSupply)) {
      throw new Error('No more share available. Must buy from the exchagne.');
    }
    if (allShareHolders.indexOf(from) >= 0) {
      throw new Error("You're already a shareholder.");
    }
    if (_value.lt(this._config.current_price)) {
      throw new Error(
        'Price paid too low. ' +
          'Paid: ' +
          _value +
          '; Current Price: ' +
          this._config.current_price
      );
    }

    var config = this.getConfig();

    var price = new BigNumber(config.current_price);
    price = price.mul(config.inflation_rate);
    config.current_price = price;

    var balance = new BigNumber(config.balance);
    balance = balance.plus(_value);
    config.balance = balance;

    this._config = config;

    var allShareHolders = this._allShareHolders;
    allShareHolders.push(from);
    this._allShareHolders = allShareHolders;

    this.balances.set(from, 1);
    this.transferEvent(true, this._config.chairman, from, 1);
  },

  newOrder: function(_type, _price) {
    var config = this.getConfig();
    var order = new Order();
    order.id = config.orderSeq;
    config.orderSeq += 1;
    order.type = _type;
    order.price = new BigNumber(_price);
    var _now = Date.now();
    order.timeStamp = parseInt(_now / 1000);

    var from = Blockchain.transaction.from;
    order.maker = from;
    order.status = '0';

    if (_type === '1') {
      //trying to buy NRT, hand over NAS
      //Hand over NAS
      var _value = new BigNumber(Blockchain.transaction.value);
      if (_value.lt(new BigNumber(_price))) {
        throw new Error(
          'You must deposit the number of NAS as the price you said you will pay'
        );
      }
      order.balance.plus(_value);
      var buyIds = this._buyOrderIds;
      buyIds.push(order.id);
      this._buyOrderIds = buyIds;
    } else if (_type === '2') {
      //trying to sell NRT, hand over NRT
      //Must already own a NRT
      var balance = this.balances.get(from);
      if (!balance) {
        throw new Error(
          'You need to own a NRT share before selling. Buy it from this smart contract or from someone on the exchange'
        );
      }
      balance = new BigNumber(balance);
      if (balance.lt(1)) {
        throw new Error(
          'Your NRT balance is currently 0. Did you already have a sell order?'
        );
      }

      //hand over NRT
      this.balances.set(from, 0);
      var sellIds = this._sellOrderIds;
      sellIds.push(order.id);
      this._sellOrderIds = sellIds;
    } else {
      throw new Error('Order type error. Must be buy or sell');
    }

    this._config = config;
    this.orders.set(order.id, order);

    var _myOrders = this.myOrders.get(from) || [];
    _myOrders.push(order.id);
    this.myOrders.set(from, _myOrders);
  },

  takeOrder: function(_id) {
    var from = Blockchain.transaction.from;
    var order = this.orders.get(_id);
    if (!order) {
      throw new Error("Sorry, can't fill an order that does not exsit");
    }
    if (order.status !== '0') {
      throw new Error('Sorry order must be live to take');
    }
    //i'm selling to the buyer who made the order, hand NRT to maker, receive NAS
    if (order.type === '1') {
      //receive NAS
      //charge comission here, it's the only place we charge commission because when someone is selling their NRT the price should've gone up
      var config = this.getConfig();
      var commission = amount.times(config.commission);
      this._profit = this._profit.plus(commission);
      var amount = new BigNumber(order.balance);
      var seller_proceed = amount.minus(commission);
      var result = Blockchain.transfer(from, seller_proceed);
      if (!result) {
        throw new Error('Take a buy: Receive NAS failed.');
      }
      //transfer NRT
      this.balances.set(from, 0);
      this.balances.set(order.maker, 1);
      this.transferEvent(true, from, order.maker, 1);
      //deregister the old shareholder, register the new shareholder
      var allShareHolders = this._allShareHolders;
      for (const [i, shareHolder] of allShareHolders.entries()) {
        if (shareHolder === from) {
          allShareHolders[i] = order.maker;
          break;
        }
      }
      this._allShareHolders = allShareHolders;
    } else if (order.type === '2') {
      //I'm buying NRT from the seller, send NAS to maker, receive NRT
      //send NAS
      var _value = new BigNumber(Blockchain.transaction.value);
      if (_value.lt(order.price)) {
        throw new Error(
          'NAS paid too low. ' +
            'Paid: ' +
            _value +
            '; Listing Price: ' +
            order.price
        );
      }
      var result = Blockchain.transfer(order.maker, _value);
      if (!result) {
        throw new Error('Take a sell: Receive NAS failed.');
      }
      //receive NRT
      this.balances.set(from, 1);
      this.transferEvent(true, order.maker, from, 1);
      //deregister the old shareholder register the new shareholder
      var allShareHolders = this._allShareHolders;
      for (const [i, shareHolder] of allShareHolders.entries()) {
        if (shareHolder === order.maker) {
          allShareHolders[i] = from;
          break;
        }
      }
      this._allShareHolders = allShareHolders;
    } else {
      throw new Error('Wrong order type. buy or sell allowed');
    }

    // mark contract as finished
    order.status = '1';
    this.order.put(_id, order);
  },

  cancelOrder: function(_id) {
    var from = Blockchain.transaction.from;
    var order = this.orders.get(_id);
    if (!order) {
      throw new Error("Sorry, can't fill an order that does not exsit");
    }
    if (order.status !== '0') {
      throw new Error('Sorry order must be live to cancel');
    }
    if (from !== order.maker) {
      throw new Error('Only the maker can cancel the order');
    }
    //I was buying NRT. refund my NAS
    if (order.type === '1') {
      //receive NAS
      var amount = new BigNumber(order.balance);
      var result = Blockchain.transfer(from, amount);
      if (!result) {
        throw new Error('Cancel: Receive NAS failed.');
      }
    } else if (order.type === '2') {
      // I was selling NRT, refund my NRT
      //receive NRT
      this.balances.set(from, 1);
      this.transferEvent(true, from, from, 1);
    } else {
      throw new Error('Wrong order type. buy or sell allowed');
    }

    // mark contract as canceled
    order.status = '2';
    this.order.put(_id, order);
  },

  getBuyOrderIds: function() {
    return this._buyOrderIds;
  },

  getSellOrderIds: function() {
    return this._sellOrderIds;
  },

  getOrderDetail: function(_id) {
    const result = this.orders.get(_id);
    return result;
  },

  getMyOrders: function(from) {
    var result = this.myOrders.get(from);
    return result;
  },

  getOrderSeq: function() {
    var config = this.getConfig();
    return config.orderSeq;
  },
  getShareHolderDetail: function(address) {
    var from = Blockchain.transaction.from;
    var config = this.getConfig();
    if (from !== config.chairman && from !== address) {
      throw new Error("Only chairman or yourself can see shareHolder's detail");
    }

    const result = this.shareHoldersDetail.get(address);
    return result;
  },

  setShareHolderDetail: function(_name, _contact) {
    var from = Blockchain.transaction.from;
    var allShareHolders = this._allShareHolders;
    if (allShareHolders.indexOf(from) < 0) {
      throw new Error(
        'You need to own a NRT share before registering. Buy it from this smart contract or from someone on the exchange'
      );
    }
    var shareHolder = this.shareHoldersDetail.get(from);
    if (!shareHolder) {
      shareHolder = new ShareHolder();
    }
    shareHolder.name = _name;
    shareHolder.contact = _contact;
    this.shareHoldersDetail.put(from, shareHolder);
  },

  setNewChairman: function(address) {
    var from = Blockchain.transaction.from;
    var config = this.getConfig();
    if (from !== config.chairman) {
      throw new Error('Only chairman can set new chairman!');
    }

    config.chairman = address;
    this._config = config;
  },

  setCommission: function(_commission) {
    var from = Blockchain.transaction.from;
    var config = this.getConfig();
    if (from !== config.chairman) {
      throw new Error('Only chairman can set commission!');
    }

    config.commission = _commission;
    this._config = config;
  },

  distributeProfit: function(_totalAmount) {
    var from = Blockchain.transaction.from;
    var config = this.getConfig();
    if (from !== config.chairman) {
      throw new Error('Only chairman can distribute profit!');
    }

    var allShareHolders = this._allShareHolders;
    var _count = new BigNumber(allShareHolders.length);
    _totalAmount = new BigNumber(_totalAmount);
    var _amount = _totalAmount.div(_count);
    this._profit = this._profit.minus(_totalAmount);
    for (const [i, shareHolder] of allShareHolders.entries()) {
      var result = Blockchain.transfer(shareHolder, _amount);
      if (!result) {
        throw new Error(
          'distributeProfit failed at: ' +
            i +
            '. consider manually doing it for the rest'
        );
      }
    }
  },

  transferIn: function(_type) {
    var _value = new BigNumber(Blockchain.transaction.value);
    if (_type === '1') {
      this._profit = this._profit.plus(_value);
    } else {
      var config = this.getConfig();
      var balance = new BigNumber(config.balance);
      balance = balance.plus(_value);
      config.balance = balance;
      this._config = config;
    }
  },

  transferOut: function(_to, _amount) {
    var from = Blockchain.transaction.from;
    var config = this.getConfig();
    if (from !== config.chairman) {
      throw new Error('Only chairman can transfer funds out!');
    }

    var config = this.getConfig();
    var balance = new BigNumber(config.balance);
    balance = balance.minus(new BigNumber(_amount));
    config.balance = balance;
    this._config = config;

    var result = Blockchain.transfer(_to, _amount);
    if (!result) {
      throw new Error('Transfer funds out failed. We are doomed.');
    }
  },

  getAllShareHolders: function() {
    return this._allShareHolders;
  },

  getCurrentPrice: function() {
    const result = this.getConfig().current_price;
    return result;
  },

  getCommission: function() {
    const result = this.getConfig().commission;
    return result;
  },

  getProfit: function() {
    return this._profit;
  },

  getConfig: function() {
    return this._config;
  },

  // Returns the name of the token
  name: function() {
    return this._name;
  },

  // Returns the symbol of the token
  symbol: function() {
    return this._symbol;
  },

  // Returns the number of decimals the token uses
  decimals: function() {
    return this._decimals;
  },

  totalSupply: function() {
    return this._totalSupply.toString();
  },

  balanceOf: function(owner) {
    var balance = this.balances.get(owner);

    if (balance instanceof BigNumber) {
      return balance.toString();
    } else {
      return '0';
    }
  },

  transfer: function(to, value) {
    value = new BigNumber(value);
    if (value.lt(0)) {
      throw new Error('invalid value.');
    }

    var from = Blockchain.transaction.from;
    var balance = this.balances.get(from) || new BigNumber(0);

    if (balance.lt(value)) {
      throw new Error('transfer failed.');
    }

    this.balances.set(from, balance.sub(value));
    var toBalance = this.balances.get(to) || new BigNumber(0);
    this.balances.set(to, toBalance.add(value));

    this.transferEvent(true, from, to, value);
  },

  transferFrom: function(from, to, value) {
    var spender = Blockchain.transaction.from;
    var balance = this.balances.get(from) || new BigNumber(0);

    var allowed = this.allowed.get(from) || new Allowed();
    var allowedValue = allowed.get(spender) || new BigNumber(0);
    value = new BigNumber(value);

    if (value.gte(0) && balance.gte(value) && allowedValue.gte(value)) {
      this.balances.set(from, balance.sub(value));

      // update allowed value
      allowed.set(spender, allowedValue.sub(value));
      this.allowed.set(from, allowed);

      var toBalance = this.balances.get(to) || new BigNumber(0);
      this.balances.set(to, toBalance.add(value));

      this.transferEvent(true, from, to, value);
    } else {
      throw new Error('transfer failed.');
    }
  },

  transferEvent: function(status, from, to, value) {
    Event.Trigger(this.name(), {
      Status: status,
      Transfer: {
        from: from,
        to: to,
        value: value
      }
    });
  },

  approve: function(spender, currentValue, _value) {
    var from = Blockchain.transaction.from;

    var oldValue = this.allowance(from, spender);
    if (oldValue != currentValue.toString()) {
      throw new Error('current approve value mistake.');
    }

    var balance = new BigNumber(this.balanceOf(from));
    var value = new BigNumber(_value);

    if (value.lt(0) || balance.lt(value)) {
      throw new Error('invalid value.');
    }

    var owned = this.allowed.get(from) || new Allowed();
    owned.set(spender, value);

    this.allowed.set(from, owned);

    this.approveEvent(true, from, spender, value);
  },

  approveEvent: function(status, from, spender, value) {
    Event.Trigger(this.name(), {
      Status: status,
      Approve: {
        owner: from,
        spender: spender,
        value: value
      }
    });
  },

  allowance: function(owner, _spender) {
    var owned = this.allowed.get(owner);

    if (owned instanceof Allowed) {
      var spender = owned.get(_spender);
      if (typeof spender != 'undefined') {
        return spender.toString(10);
      }
    }
    return '0';
  }
};

module.exports = NRTContract;