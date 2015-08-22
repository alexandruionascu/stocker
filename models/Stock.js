var Waterline = require('waterline');

var Stock = Waterline.Collection.extend({
  identity: 'stock',
  connection: 'MYSQL',

  attributes: {
    id: {
      type: 'string',
      required: 'true',
      unique: true,
      primaryKey: true
    },
    user_id: {
      type: 'string',
      required: true
    },
    number: {
      type: 'integer',
      required: true,
    },
    object: {
      type: 'string',
      required: true
    },
    unit: {
      type: 'string',
      required: true
    },
    stock: {
      type: 'integer',
      required: true
    },
    price: {
      type: 'float',
      required: true
    },
    stock_value: {
      type: 'float',
      required: true
    },
    date: {
      type: 'date',
      required: true
    },
    contability: {
      type: 'string',
      required: true
    },
    bill_number: {
      type: 'string',
      required: true
    },
    provider: {
      type: 'string',
    },

    getDocument: function() {
      return this.bill_number + '/' + this.date + '/' + this.provider;
    }
  }
});

module.exports = Stock;
