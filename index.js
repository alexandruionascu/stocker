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
  genid: function(req) {
    return  // use UUIDs for session IDs
  },
  secret: 'keyboard cat'
}))
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
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
      var user = {};
      return done(null, user);
  })
);

function genuuid() {
  return Guid.create();
}





//serve images
app.use("/images", express.static(__dirname + '/images'));
//serve css
app.use("/css", express.static(__dirname + '/css'));
//serve js
app.use("/js", express.static(__dirname + '/js'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/login.html');
});

app.get('/dashboard', function (req, res) {
  res.sendFile(__dirname + '/dashboard.html');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Stocker Server started listening on port 3000');
});



app.get('/auth/facebook', passport.authenticate('facebook', {authType: 'reauthenticate'}));
  // GET /auth/facebook/callback
  // Use passport.authenticate() as route middleware to authenticate the
  // request. If authentication fails, the user will be redirected back to the
  // login page. Otherwise, the primary route function function will be called,
  // which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/', successRedirect: '/dashboard' }));

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/hello', ensureAuthenticated, function(req,res) {
  res.render('hello', {layout: 'dashboard_layout', name: 'alex'});
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}
