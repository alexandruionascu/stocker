var express = require('express');
var facebook = require('./fb.js');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var Guid = require('guid');
var expressLayouts = require('express-ejs-layouts');
var FacebookStrategy = require('passport-facebook').Strategy;


var app = express();
app.set('view engine', 'ejs');
app.set("views","./views");
app.use(expressLayouts);
app.use(session({
  secret: 'keyboard cat'
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

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
      return done(null, profile);
  })
);


//serve images
app.use("/images", express.static(__dirname + '/images'));
//serve css
app.use("/css", express.static(__dirname + '/css'));
//serve js
app.use("/js", express.static(__dirname + '/js'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/login.html', {user: req.user});
});



var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Stocker Server started listening on port 3000');
});



app.get('/auth/facebook', passport.authenticate('facebook', {authType: 'reauthenticate'}));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/', successRedirect: '/dashboard' }));

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/dashboard', ensureAuthenticated, function(req, res) {
  res.render('home', {layout: 'dashboard_layout', title: 'Home', name: 'alex', user: req.user});
});

app.get('/add', ensureAuthenticated, function(req, res) {
  res.render('add', {layout: 'dashboard_layout', title: 'Add', name: 'alex', user: req.user});
});



function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}
