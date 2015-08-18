var express = require('express');
var facebook = require('./fb.js');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

passport.use('facebook', new FacebookStrategy({
  clientID        : facebook.fbConfig.appID,
  clientSecret    : facebook.fbConfig.appSecret,
  callbackURL     : facebook.fbConfig.callbackUrl,
  profileFields: ['id', 'displayName', 'name', 'gender', 'picture', 'emails']
},

  // facebook will send back the tokens and profile
  function(access_token, refresh_token, profile, done) {
      console.log(profile);
      console.log(access_token);
  })
);




var app = express();

//serve images
app.use("/images", express.static(__dirname + '/images'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/login.html');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Stocker Server started listening on port 3000');
});

/*
// route for facebook authentication and login
// different scopes while logging in
app.get('/login/facebook', function() {
  passport.authenticate('facebook', { scope : 'email' });
});

// handle the callback after facebook has authenticated the user
app.get('/login/facebook/callback', function() {
  passport.authenticate('facebook', {
    successRedirect : '/home',
    failureRedirect : '/'
  });
});
*/


app.get('/auth/facebook', passport.authenticate('facebook'));
  // GET /auth/facebook/callback
  // Use passport.authenticate() as route middleware to authenticate the
  // request. If authentication fails, the user will be redirected back to the
  // login page. Otherwise, the primary route function function will be called,
  // which, in this example, will redirect the user to the home page.
  app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
