'use strict';

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

var GlobalConfig = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.chairman = obj.chairman;
    this.current_price = obj.current_price;
    this.balance = obj.balance;
    this.orderSeq = obj.orderSeq;
    this.commission = obj.commission;
  } else {
    this.chairman = '';
    this.current_price = new BigNumber(0);
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

var Trader = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.name = obj.name;
    this.contact = obj.contact;
    this.volume = obj.volume;
  } else {
    this.name = '';
    this.contact = '';
    this.volume = new BigNumber(0);
  }
};

Trader.prototype = {
  toString: function() {
    return JSON.stringify(this);
  }
};

var Order = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.id = obj.id;
    this.type = obj.type; //  1 is buy; 2 is sell
    this.price = obj.price; // price in RMBnt / Wei
    this.amount = obj.amount; // amount in Wei
    this.balance = obj.balance; // balance in Wei
    this.maker = obj.maker;
    this.taker = obj.taker;
    this.status = obj.status; // 0 is live, 1 is done, 2 is canceled
  } else {
    this.id = '';
    this.type = '';
    this.price = new BigNumber(0);
    this.amount = new BigNumber(0);
    this.balance = new BigNumber(0);
    this.maker = '';
    this.taker = '';
    this.status = '';
  }
};

Order.prototype = {
  toString: function() {
    return JSON.stringify(this);
  }
};

var RMBntContract = function() {
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
    _allTraders: {
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
    tradersDetail: {
      parse: function(value) {
        return new Trader(value);
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

RMBntContract.prototype = {
  init: function() {
    var from = Blockchain.transaction.from;

    this._name = 'RMB Nas Tether';
    this._symbol = 'RMBnt';
    this._decimals = 2;
    // 100 trillion RMB. Should be enough
    this._totalSupply = new BigNumber(10 ** 14);
    this._profit = new BigNumber(0);
    var allTraders = [];
    allTraders.push(from);
    this._allTraders = allTraders;
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

  newOrder: function(_type, _amount, _price) {
    var config = this.getConfig();
    var order = new Order();
    order.id = config.orderSeq;
    config.orderSeq += 1;
    order.type = _type;
    var price = new BigNumber(_price);
    order.price = price;
    var amount = new BigNumber(_amount);
    order.amount = _amount;

    var from = Blockchain.transaction.from;
    order.maker = from;
    order.status = '0';

    if (_type === '1') {
      //trying to buy RMBnt, hand over NAS
      //Hand over NAS
      var _value = new BigNumber(Blockchain.transaction.value);

      if (_value.lt(amount)) {
        throw new Error(
          'You must deposit the number of NAS as the amount you said you will pay'
        );
      }
      //Set contract balance in Wei
      order.balance = _value;
      var buyIds = this._buyOrderIds;
      buyIds.push(order.id);
      this._buyOrderIds = buyIds;
    } else if (_type === '2') {
      //trying to sell RMBnt, hand over RMBnt
      //Must already own this much RMBnt
      var balance = this.balances.get(from);
      var _valueCheck = amount.times(price);
      if (!balance || balance.lt(new BigNumber(_valueCheck))) {
        throw new Error(
          'You need to own this much RMBnt before selling. Buy some on the exchange first.'
        );
      }
      //Set contract balance in Wei
      order.balance = amount;
      //deduct maker's RMBnt
      var newBalance = balance.sub(_valueCheck);
      this.balances.set(from, newBalance);

      var sellIds = this._sellOrderIds;
      sellIds.push(order.id);
      this._sellOrderIds = sellIds;
    } else {
      throw new Error('Order type error. Must be 1 (buy) or 2 (sell)');
    }

    this._config = config;
    this.orders.set(order.id, order);

    var _myOrders = this.myOrders.get(from) || [];
    _myOrders.push(order.id);
    this.myOrders.set(from, _myOrders);
  },

  takeOrder: function(_id, _amount) {
    var from = Blockchain.transaction.from;
    var amount = new BigNumber(_amount);
    var order = this.orders.get(_id);
    if (!order) {
      throw new Error("Sorry, can't fill an order that does not exsit");
    }
    if (order.status !== '0') {
      throw new Error('Sorry order must be live to take');
    }
    var orderBalance = new BigNumber(order.balance);
    var orderPrice = new BigNumber(order.price);
    if (orderBalance.lt(amount)) {
      throw new Error('Order only has ' + orderBalance + ' Wei left');
    }

    var takerBalance = this.balances.get(from) || new BigNumber(0);
    var curRMBnt = amount.times(orderPrice);
    var config = this.getConfig();
    //i'm selling RMBnt to maker, hand RMBnt to maker, receive NAS
    if (order.type === '1') {
      // make sure I have enough RMBnt
      if (takerBalance.lt(curRMBnt)) {
        throw new Error(
          'Not enough RMBnt to take this order. selling: ' +
            curRMBnt +
            ' your balance: ' +
            takerBalance
        );
      }
      // deduct balance from order
      order.balance = orderBalance.sub(amount);
      //charge comission here
      var commission = amount.times(config.commission);
      this._profit = this._profit.add(commission);
      //receive NAS
      var seller_proceed = amount.sub(commission);
      var result = Blockchain.transfer(from, seller_proceed);
      if (!result) {
        throw new Error('Take a buy: Receive NAS failed.');
      }
      //maker receives RMBnt from taker
      this.transfer(order.maker, curRMBnt);
    } else if (order.type === '2') {
      //I'm buying RMBnt from the maker, send NAS to maker, receive RMBnt
      var _value = new BigNumber(Blockchain.transaction.value);
      if (_value.lt(amount)) {
        throw new Error(
          'NAS paid too low. ' +
            'Paid: ' +
            _value +
            '; trying to take an order size: ' +
            amount
        );
      }
      // deduct balance from order
      order.balance = orderBalance.sub(amount);
      //charge comission here
      var commission = amount.times(config.commission);
      this._profit = this._profit.add(commission);
      //send NAS
      var seller_proceed = _value.sub(commission);
      var result = Blockchain.transfer(order.maker, seller_proceed);
      if (!result) {
        throw new Error('Take a sell: Send NAS failed.');
      }
      //taker receive RMBnt maker's RMBnt already deducted
      takerBalance = takerBalance.add(curRMBnt);
      this.balances.set(from, takerBalance);
      this.transferEvent(true, order.maker, from, curRMBnt);
    } else {
      throw new Error('Wrong order type. buy or sell allowed');
    }

    // if amount left is 0 mark contract as finished
    if (order.balance == 0) {
      order.status = '1';
    }
    // taker and maker get volume boost
    var taker = this.tradersDetail.get(from);
    if (!taker) {
      taker = new Trader();
      var _allTraders = this.allTraders;
      _allTraders.push(from);
      this.allTraders = _allTraders;
    }
    var maker = this.tradersDetail.get(order.maker) || new Trader();
    if (!maker) {
      maker = new Trader();
      var _allTraders = this.allTraders;
      _allTraders.push(order.maker);
      this.allTraders = _allTraders;
    }
    var takerVolume = new BigNumber(taker.volume);
    var makerVolume = new BigNumber(maker.volume);
    takerVolume = takerVolume.add(amount);
    makerVolume = makerVolume.add(amount);
    this.tradersDetail.put(from, taker);
    this.tradersDetail.put(order.maker, maker);

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
    var amount = new BigNumber(order.balance);
    var orderPrice = new BigNumber(order.price);
    //I was buying RMBnt. refund my NAS
    if (order.type === '1') {
      //receive NAS
      var result = Blockchain.transfer(from, amount);
      if (!result) {
        throw new Error('Cancel: Receive NAS failed.');
      }
    } else if (order.type === 'sell') {
      // I was selling RMBnt, refund my RMBnt
      //receive NRT
      var curRMBnt = amount.times(orderPrice);
      var makerBalance = this.balances.get(from) || new BigNumber(0);
      makerBalance.add(curRMBnt);
      this.balances.set(from, makerBalance);
      this.transferEvent(true, from, from, curRMBnt);
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

  getOrderSeq: function() {
    var config = this.getConfig();
    return config.orderSeq;
  },

  getAllTraders: function() {
    return this.allTraders;
  },

  getTraderDetail: function(address) {
    const result = this.tradersDetail.get(address);
    return result;
  },

  setTraderDetail: function(_name, _contact) {
    var from = Blockchain.transaction.from;
    var trader = this.tradersDetail.get(from);
    if (!trader) {
      trader = new Trader();
      var _allTraders = this.allTraders;
      _allTraders.push(from);
      this.allTraders = _allTraders;
    }
    trader.name = _name;
    trader.contact = _contact;
    this.tradersDetail.put(from, trader);
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

  transferIn: function(_type) {
    var _value = new BigNumber(Blockchain.transaction.value);
    this._profit = this._profit.add(_value);
  },

  transferOut: function(_to, _amount) {
    var from = Blockchain.transaction.from;
    var config = this.getConfig();
    if (from !== config.chairman) {
      throw new Error('Only chairman can transfer funds out!');
    }
    var amount = new BigNumber(_amount);
    this._profit = this._profit.sub(amount);

    var result = Blockchain.transfer(_to, _amount);
    if (!result) {
      throw new Error('Transfer funds out failed. We are doomed.');
    }
  },

  getCurrentPrice: function() {
    const result = this.getConfig().current_price;
    return result;
  },

  setCurrentPrice: function(_price) {
    var config = this.getConfig();
    config.current_price = _price;
    this._config = config;
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

module.exports = RMBntContract;
