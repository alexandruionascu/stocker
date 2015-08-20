var express = require('express');
var facebook = require('./fb.js');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var Guid = require('guid');
var expressLayouts = require('express-ejs-layouts');
var FacebookStrategy = require('passport-facebook').Strategy;
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var models = require('./models');


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
      //store user in the database
      var user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        photo: profile.photos[0].value,
        provider: profile.provider
      };
      app.models.user.create(user, function(err, model) {
        if(err)
          console.log(err);
      });
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

app.post('/addcsv',  jsonParser, function(req,res){
    console.log(req.body.id);
    var lines = req.body.data.split('\n');
    console.log(lines[0]);
    res.send(req.body);
});



function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}

//initialize Waterline
models.waterline.initialize(models.config, function(err, models) {
  if(err) throw err;
  app.models = models.collections;
  app.connections = models.connections;

  var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Stocker Server started listening on port 3000');
  });
});
