var mongoose = require('mongoose');
var db = require('../config');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var linkSchema = new Schema({
  id: String,
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: { type: Number, default: 0 },
  time: { type: Date, default: Date.now },

});

linkSchema.methods.shash = function(docs, opts, fn) {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);
  this.save(function(err) {
    console.log('errr', err);
  });
};

module.exports = linkSchema;

