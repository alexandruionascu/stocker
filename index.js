var express = require('express');
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
