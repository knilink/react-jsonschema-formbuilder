var { createStore } = require('redux');
var reducer = require('./reducers');
var store = createStore(reducer, {});
module.exports = store;
