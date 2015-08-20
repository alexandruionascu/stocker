var Waterline = require('waterline');

var User = Waterline.Collection.extend({
  identity: 'user',
  connection:'MYSQL',

  attributes: {

    id: {
      type: 'string',
      required: true,
      unique: true
    },

    name: {
      type: 'string',
      required: true
    },

    email: {
      type: 'string',
      required: true,
    },
    photo: {
      type: 'string'
    },
    provider: {
      type: 'string'
    }
  }

});

module.exports = User;
