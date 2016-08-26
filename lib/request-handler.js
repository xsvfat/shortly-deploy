var mongoose = require('mongoose');
var db = require('../app/config');
var User = require('../app/models/user');
var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');
var Link = require('../app/models/link');

var NewLink = mongoose.model('NewLink', Link);
var NewUser = mongoose.model('NewUser', User);

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {

  NewLink.find({}, function(err, result) {
    console.log('SENDING BACK RIGHT LINKS?: ', result);
    res.status(200).send(result);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  NewLink.findOne({ 'url': uri}, function(err, result) {
    console.log('Does url exist?: ', result);
    //existing
    if (result) {
      console.log('URL exists');
      res.status(200).send(result);

    //not existing, therefore create link
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        NewLink.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        }, function(err, result) {
          console.log('NEW LINK: ', result);
          if (err) {
            console.log('Error creating new link: ', err);
          } else {
            result.shash();
            res.status(200).send(result);
          }
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  NewUser.findOne({'username': username}, function(err, result) {
    if (result === null) {
      console.log('Username does not exist');
      res.redirect('/login');
    } else {
      //compare password
      result.comparePassword(password, function(match) {
        if (match) {
          console.log('Password match!');
          util.createSession(req, res, result);
        } else {
          console.log('Password doesn\'t match!');
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  //do the following if new username
  NewUser.findOne({'username': username}, function(err, result) {
    if (result === null) {
      console.log('Account doesn\'t exist');
      NewUser.create({
        username: username, 
        password: password
      }, function(err, doc) {
        if (err) {
          console.log('Error occured creating user!: ', err);
        }
        doc.hashPassword();
        util.createSession(req, res, doc);
      });

    } else {
      console.log('Account already exists');
      res.redirect('/signup');
    }
  });
};

exports.navToLink = function(req, res) {

  NewLink.findOne({ 'code': req.params[0]}, function(err, result) {
    if (!result) {
      res.redirect('/');
    } else {
      result.visits += 1;
      result.save(function(err) {
        if (err) {
          console.log('errr', err);
        }

        return res.redirect(result.url);
      });
       
    }
  });
};