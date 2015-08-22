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
var uuid = require('node-uuid');


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
      //check if the user exists
      if(app.models.user.count({id: profile.id}) === 0) {
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
      }

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
  res.render('add', {layout: 'dashboard_layout', title: 'Add', user: req.user});
});

app.get('/view', ensureAuthenticated, function(req, res) {
  res.render('view', {layout: 'dashboard_layout', title: 'View', user: req.user});
});

app.post('/addcsv/:userid',ensureAuthenticated, jsonParser, function(req,res){
    var lines = req.body.data.split('\n');
    for(var i=0; i < lines.length ; i++) {
      //CSV parse, get the proprieties
      var props = lines[i].split(',');
      //document number
      var doc = props[8];
      var billAttributes = doc.split('/');
      var bill_number = billAttributes[0] + '/' + billAttributes[1];
      var provider = billAttributes[3];
      //change date format
      var dateProps = props[6].split('.');
      //YEAR-MONTH-DAY Format
      var date = new Date(dateProps[2],dateProps[1],dateProps[0]);

      var stock = {
        user_id: req.params.userid,
        //generate GUID
        id: uuid.v1(),
        number: props[0],
        object: props[1],
        unit: props[2],
        stock: props[3],
        price: props[4],
        stock_value: props[5],
        date: date,
        contability: props[7],
        bill_number: bill_number,
        provider: provider
      };
      console.log(stock);

      app.models.stock.create(stock, function(err, model) {
        if(err)
          console.log(err);
      });


    }
    res.send(req.body);
});

app.get('/stocks/:userid', ensureAuthenticated, function(req,res) {
  app.models.stock.find().where({user_id: req.params.userid}).exec(function(err, stocks) {
    if(err)
      throw err;
    res.send(stocks);
  });

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
    console.log('Stocker Server started listening on port 3000');
  });
});
