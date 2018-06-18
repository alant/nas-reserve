"use strict";

var GlobalConfig = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.chairman = obj.chairman;
    this.share_holders = obj.share_holders;
    this.inflation_rate = obj.inflation_rate;
    this.initial_price = obj.initial_price;
    this.current_price = obj.current_price;
    this.balance = obj.balance;
  } else {
    this.chairman = null;
    this.share_holders = [];
    this.inflation_rate = new BigNumber(1.05);
    this.initial_price = new BigNumber(0.025 * 10 ** 18);
    this.current_price = new BigNumber(0.025 * 10 ** 18);
    this.balance = new BigNumber(0);
  }
};

GlobalConfig.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var ShareHolder = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.name = obj.name;
    this.contact = obj.contact;
  } else {
    this.name = "";
    this.contact = "";
  }
};

ShareHolder.prototype = {
  toString: function () {
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
    if (typeof obj != "undefined") {
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
    _config: {
      parse: function(text) {
        return new GlobalConfig(text);
      },
      stringify: function(o) {
        return o.toString();
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
    shareHolders: {
      parse: function(value) {
        return new ShareHolder(value);
      },
      stringify: function(o) {
        return o.toString();
      }
    }
  });
};

NRTContract.prototype = {
  init: function() {
    this._name = "Nas Reserve Token";
    this._symbol = "NRT";
    this._decimals = 0;
    this._totalSupply = new BigNumber(500);

    var from = Blockchain.transaction.from;
    this.balances.set(from, this._totalSupply);
    this.transferEvent(true, from, from, this._totalSupply);

    var config = new GlobalConfig(null);
    config.chairman = from;
    config.share_holders.push(from);
    this._config = config;
  },

  buyOneShare: function(height) {
    var _value = new BigNumber(Blockchain.transaction.value);
    var from = Blockchain.transaction.from;
    if (_value.lt(this._config.current_price)) {
      throw new Error(
        "Price paid too low. " +
          "Paid: " +
          _value +
          "; Current Price: " +
          this._config.current_price
      );
    }

    var config = this.getConfig();
    var price = new BigNumber(config.current_price);
    price = price.mul(config.inflation_rate);
    config.current_price = price;
    this._config = config;
    // var _balance = new BigNumber(this._config.balance);
    // _balance = _balance.plus(_value);
    // this._config.balance = _balance;

    // this._config.share_holders.push(from);

    // var _price = new BigNumber(this._config.current_price);
    // _price = _price.mul(new BigNumber(this._config.inflation_rate));
    // this._config.current_price = _price;
      
    this.balances.set(from, 1);
    this.transferEvent(true, this._config.chairman, from, 1);
  },

  getCurrentPrice: function() {
    const result = this.getConfig().current_price;
    return result;
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
      return "0";
    }
  },

  transfer: function(to, value) {
    value = new BigNumber(value);
    if (value.lt(0)) {
      throw new Error("invalid value.");
    }

    var from = Blockchain.transaction.from;
    var balance = this.balances.get(from) || new BigNumber(0);

    if (balance.lt(value)) {
      throw new Error("transfer failed.");
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
      throw new Error("transfer failed.");
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
      throw new Error("current approve value mistake.");
    }

    var balance = new BigNumber(this.balanceOf(from));
    var value = new BigNumber(_value);

    if (value.lt(0) || balance.lt(value)) {
      throw new Error("invalid value.");
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
      if (typeof spender != "undefined") {
        return spender.toString(10);
      }
    }
    return "0";
  }
};

module.exports = NRTContract;
