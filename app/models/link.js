var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   initialize: function() {
//     this.on('creating', function(model, attrs, options) {
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });

var Link = new Schema({
  id: String,
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: { type: Number, default: 0 },
  time: { type: Date, default: Date.now },

});

// Link.prototype.init = function(docs, opts, fn) {
//   var shasum = crypto.createHash('sha1');
//   shasum.update(this.url);
//   this.code = shasum.digest('hex').slice(0, 5);
// };

module.exports = Link;

