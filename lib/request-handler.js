var mongoose = require('mongoose');
var db = require('../app/config');
var User = require('../app/models/user');

var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');


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
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        var newLink = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        });
        newLink.save().then(function(newLink) {
          Links.add(newLink);
          res.status(200).send(newLink);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var NewUser = mongoose.model('NewUser', User);

  NewUser.findOne({'username': username}, function(err, result) {
    console.log('The login result is: ', result);
    if (result === null) {
      console.log('Username does not exist');
      res.redirect('/login');
    } else {
      //compare password
      result.comparePassword(password, function(match) {
        console.log('password comparison result: ', match);
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
  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       res.redirect('/login');
  //     } else {
  //       user.comparePassword(password, function(match) {
  //         if (match) {
  //           util.createSession(req, res, user);
  //         } else {
  //           res.redirect('/login');
  //         }
  //       });
  //     }
  //   });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var NewUser = mongoose.model('NewUser', User);

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
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.set({ visits: link.get('visits') + 1 })
        .save()
        .then(function() {
          return res.redirect(link.get('url'));
        });
    }
  });
};