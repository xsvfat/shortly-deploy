var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connectionerror:'));
db.once('open', function() {
  console.log('we are in!!!');
});

module.exports = db;
